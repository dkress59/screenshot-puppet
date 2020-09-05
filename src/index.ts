if (process.env.NODE_ENV === 'dev')
	require('dotenv').config({ path: './.env.development.local' })
import { Request, Response } from 'express'
import { Browser } from 'puppeteer'
import express from 'express'
import bodyParser from 'body-parser'
import { headers, cache, fallback } from './util/middlewares'
import update from './routes/update'
import { client, launchBrowser } from './util'
import ParsedQuery from './types/ParsedQuery'
import Screenshot from './types/Screenshot'
//import morgan from 'morgan';

const PORT = process.env.PUPPET_PORT || 80

const app = express()

app.use(headers)
//app.use(morgan('tiny'))
app.use(bodyParser.json())
app.use('/update', update)
app.use(cache)

const makeScreenshot = async (browser: Browser, image: Screenshot) => {
	const { width, height, link, title, url, darkMode, remove } = image

	try {
		const page = await browser.newPage()

		if (width && height) await page.setViewport({ width, height })

		if (darkMode)
			await page.emulateMediaFeatures([
				{
					name: 'prefers-color-scheme',
					value: 'dark',
				},
			])

		await page.goto(url)

		if (remove)
			remove.map((sel) => {
				console.log('remove', sel)
				try {
					page.evaluate((sel) => {
						const nodes = document.querySelectorAll(sel)
						if (document.querySelectorAll(sel).length)
							for (let i = 0; i < nodes.length; i++)
								nodes[i].parentNode.removeChild(nodes[i])
					}, sel)
				} catch (error) {
					console.error(error)
				}
				return
			})

		const screenshot = await page.screenshot()
		//@ts-ignore
		const src = screenshot.toString('base64') // ToDo: Why isn't btoa() working?
		image.source = src

		const cacheId = `${link}-${width}x${height}`
		await client.setex(cacheId, 60 * 60 * 24 * 30, src)
		console.log(`cache set for ${cacheId}`)
		//return { src, link, title };
	} catch (error) {
		console.log(error)
		image.error = error
		//return { error, link, title, url };
	}
	return image
}

app.get('/', async (req: Request, res: Response) => {
	const image = new Screenshot(new ParsedQuery(req))

	const browser = await launchBrowser(res)

	const response = await makeScreenshot(browser, image)
	const status = response.error === undefined ? 200 : 500
	res.status(status).send(JSON.stringify(response))

	console.log('closing browser...')
	await browser.close().catch((e: unknown) => void e)
	return
})

app.post('/', async (req: Request, res: Response) => {
	const { cached, needed } = req.body
	const browser = await launchBrowser(res)

	const returns = []
	const errors = []
	for await (const image of needed)
		returns.push(
			(async () => {
				try {
					const response = await makeScreenshot(browser, image)
					return response
				} catch (error) {
					console.error(error)
					errors.push({
						error,
						url: image.url,
						link: image.link,
						title: image.title,
					})
					return
				}
			})()
		)

	Promise.all(returns)
		.then((images) => {
			if (images.filter((i) => i && i.error !== undefined).length)
				console.log(
					'Error count:',
					images.filter((i) => i && i.error !== undefined).length
				)
			res.status(200).send(JSON.stringify([...cached, ...images]))
		})
		.catch((err) => {
			console.error(err)
			res.status(500).send(JSON.stringify({ error: err }))
		})
		.finally(() => {
			console.log('closing browser...')
			browser.close().catch((e: any) => void e)
		})
})

app.use('/', fallback)

app.listen(PORT)
