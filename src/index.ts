import { Request, Response, NextFunction } from "express";
import { Browser } from "puppeteer";

const puppeteer = require("puppeteer");
const express = require("express");
const bodyParser = require("body-parser");
//const morgan = require('morgan')
const redis = require("redis");
const util = require("util");
const shell = require("shelljs");

const PORT = process.env.PUPPET_PORT || 80;
const REDIS = process.env.PUPPET_REDIS || "redis://127.0.0.1:6379";
const ALLOW_ACCESS = process.env.PUPPET_ACCESS || "*";

const app = express();
const client = redis.createClient(REDIS);
client.get = util.promisify(client.get);
client.setex = util.promisify(client.setex);

class ParsedQuery {
  public w?: string;
  public h?: string;
  public url: string = "";
  public link: string = ""; // ToDo: make optional
  public title: string = ""; // ToDo: make optional
  public darkMode?: string;
  public remove: string[] = [];

  constructor({ query }: Request) {
    const { w, h, url, link, title, darkMode, remove } = query;
    if (w) this.w = w.toString();
    if (h) this.h = h.toString();
    if (url) this.url = url.toString();
    if (link) this.link = link.toString();
    if (title) this.title = title.toString();
    if (darkMode) this.darkMode = darkMode.toString();
    if (remove && Array.isArray(remove))
      for (const rm in remove) if (typeof rm === "string") this.remove.push(rm);
  }
}

class Screenshot {
  width?: number;
  height?: number;
  url: string;
  link: string; // ToDo: make optional
  title: string; // ToDo: make optional
  private src: string | undefined = undefined;
  error?: unknown;
  darkMode?: boolean;
  remove?: string[];

  constructor(query: ParsedQuery) {
    this.width = query.w ? parseInt(query.w) : 0;
    this.height = query.h ? parseInt(query.h) : 0;
    this.url = decodeURIComponent(query.url);
    /* if (query.link)  */ this.link = query.link;
    /* if (query.title)  */ this.title = query.title;
    if (query.darkMode === "true") this.darkMode = true;
    if (query.remove && query.remove.length) this.remove = query.remove;
  }

  get source() {
    if (this.src) return this.src;
    else throw new Error("No source found for " + this.title);
  }

  set source(src: string) {
    if (src) this.src = src;
    else throw new Error("No source passed for " + this.title);
  }
}

const headers = (_req: Request, res: Response, next: NextFunction) => {
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Origin", ALLOW_ACCESS);
  res.header("Access-Control-Allow-Methods", "*");
  //res.header("Cache-Control", "private, max-age=" + 60*60*24 * 30)
  res.header("Cache-Control", "private, max-age=1");
  res.type("application/json");
  next();
};

const update = (req: Request, res: Response) => {
  if (req.query.v === "fe") {
    shell.cd("/var/www/dkress-mmxx");
    if (shell.exec("/var/www/dkress-mmxx/update.sh").code !== 0) {
      res.status(500).send({ error: "Update failed." });
    } else {
      res.status(200).send({ message: "Update complete." });
      shell.exec("/usr/local/bin/pm2 restart DK20");
    }
  } else {
    shell.cd("/var/www/screenshot-puppet");
    if (shell.exec("/var/www/screenshot-puppet/update.sh").code !== 0) {
      res.status(500).send({ error: "Update failed." });
    } else {
      res.send({ message: "Update complete." });
      shell.exec("/usr/local/bin/pm2 restart screenshot-puppet");
    }
  }
};

const cache = async (req: Request, res: Response, next: NextFunction) => {
  switch (req.method) {
    default:
      next();
      break;

    case "POST":
      if (!req.body || req.body == {})
        return res
          .status(402)
          .send({ error: "Nothing passed in the request body." });

      const needed = [];
      const cached = [];
      for await (const image of req.body) {
        const cacheId = `${image.link}-${image.w}x${image.h}`;
        try {
          const isCached = await client.get(cacheId);
          if (isCached && isCached.length) {
            console.log("cached", cacheId);
            cached.push({
              src: isCached,
              link: image.link,
              title: image.title,
            });
          } else {
            console.log("needed", cacheId);
            needed.push(image);
          }
        } catch (err) {
          console.error(err);
          needed.push(image);
        }
      }
      if (!needed || !needed.length || cached.length === req.body.length)
        return res.send(JSON.stringify(cached));

      req.body = { cached, needed };
      next();
      break;

    case "GET":
      const image = req.query;
      if (!image || !Object.entries(req.query).length)
        return res.status(400).send({ error: "Required param(s) missing." });

      const { w, h, link, title } = image;
      const cacheId = `${link}-${w}x${h}`;
      try {
        const src = await client.get(cacheId);
        if (src && src.length) {
          console.log("cached", cacheId);
          return res.send(JSON.stringify({ src, link, title }));
        } else {
          console.log("needed", cacheId);
        }
      } catch (err) {
        console.error(err);
      }

      next();
      break;
  }
};

const fallback = (req: Request, res: Response) => {
  if (req.method === "OPTIONS") res.status(200).end();

  return res
    .status(400)
    .send({ error: `${req.method} forbidden for this route.` });
};

app.use(headers);
//app.use(morgan('tiny'))
app.use(bodyParser.json());
app.use("/update", update);
app.use(cache);

const launchBrowser = async (res: Response) => {
  return await puppeteer
    .launch({
      timeout: 666,
      //handleSIGINT: false,
      defaultViewport: null,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    .catch((e: any) =>
      res
        .status(500)
        .send({ error: "error launching puppeteer: " + e.toString() })
    );
};

const makeScreenshot = async (browser: Browser, image: Screenshot) => {
  const { width, height, link, title, url, darkMode, remove } = image;

  try {
    const page = await browser.newPage();

    if (width && height) await page.setViewport({ width, height });

    if (darkMode)
      await page.emulateMediaFeatures([
        {
          name: "prefers-color-scheme",
          value: "dark",
        },
      ]);

    await page.goto(url);

    if (remove)
      remove.map((sel) => {
        console.log("remove", sel);
        try {
          page.evaluate((sel) => {
            const nodes = document.querySelectorAll(sel);
            if (document.querySelectorAll(sel).length)
              for (let i = 0; i < nodes.length; i++)
                nodes[i].parentNode.removeChild(nodes[i]);
          }, sel);
        } catch (error) {
          console.error(error);
        }
        return;
      });

    const screenshot = await page.screenshot();
    const src = screenshot.toString();
    image.source = src;

    const cacheId = `${link}-${width}x${height}`;
    await client.setex(cacheId, 60 * 60 * 24 * 30, src);
    console.log(`cache set for ${cacheId}`);
    //return { src, link, title };
  } catch (error) {
    console.log(error);
    image.error = error;
    //return { error, link, title, url };
  }
  return image;
};

app.get("/", async (req: Request, res: Response) => {
  const image = new Screenshot(new ParsedQuery(req));

  const browser = await launchBrowser(res);

  const response = await makeScreenshot(browser, image);
  const status = response.error === undefined ? 200 : 500;
  res.status(status).send(JSON.stringify(response));

  console.log("closing browser...");
  await browser.close().catch((e: unknown) => void e);
  return;
});

app.post("/", async (req: Request, res: Response) => {
  const { cached, needed } = req.body;
  const browser = await launchBrowser(res);

  const returns = [];
  const errors = [];
  for await (const image of needed)
    returns.push(
      (async () => {
        try {
          const response = await makeScreenshot(browser, image);
          return response;
        } catch (error) {
          console.error(error);
          errors.push({
            error,
            url: image.url,
            link: image.link,
            title: image.title,
          });
          return;
        }
      })()
    );

  Promise.all(returns)
    .then((images) => {
      if (images.filter((i) => i && i.error !== undefined).length)
        console.log(
          "Error count:",
          images.filter((i) => i && i.error !== undefined).length
        );
      res.status(200).send(JSON.stringify([...cached, ...images]));
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(JSON.stringify({ error: err }));
    })
    .finally(() => {
      console.log("closing browser...");
      browser.close().catch((e: any) => void e);
    });
});

app.use("/", fallback);

app.listen(PORT);
