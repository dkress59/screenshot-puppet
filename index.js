const puppeteer = require('puppeteer')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/', async (req, res) => {
	console.log(req.query)
	try {
		const browser = await puppeteer.launch({ defaultViewport: null })
		const page = await browser.newPage()
		await page.setViewport({
			width: parseInt(req.query.w),
			height: parseInt(req.query.h)
		})
		await page.goto(decodeURIComponent(req.query.url)) // URL is given by the "user" (your client-side application)
		const screenshotBuffer = await page.screenshot()
		const screenshot = screenshotBuffer.toString('base64')

		// Respond with the image
		res.writeHead(200, {
			'Content-Type': 'text/plain',
			'Content-Length': screenshot.length
		})
		res.end(screenshot)
		//res.json([screenshotBuffer.toString()])

		await browser.close()
	}
	catch (err) {
		throw new Error(err)
	}
})

app.post('/', async (req, res) => {
	const w = parseInt(req.body.w)
	const h = parseInt(req.body.h)
	if (!w || !h) return res.end()

	const browser = await puppeteer.launch({ defaultViewport: null })
	const page = await browser.newPage()

	await page.setViewport({
		width: parseInt(req.body.w),
		height: parseInt(req.body.h)
	})


	const screenshots = []
	try {
		for await (const profile of req.body.urls) {
			if (profile.url !== '') {
				await page.goto(decodeURIComponent(profile.url))
				//await page.evaluate()
				const screenshotBuffer = await page.screenshot()

				screenshots.push({
					link: profile.link,
					img: getBase64Image(screenshotBuffer).toString()
				})
			}
		}

		console.log(screenshots)
		res.status(200).send(JSON.stringify(screenshots))
	}
	catch (err) {
		console.error(err)
		res.status(500).send({ error: err })
	}



	await browser.close()
})

app.listen(4848)