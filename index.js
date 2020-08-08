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
	if (!req.query.url || !req.query.w || !req.query.h)
		res.status(402).end({ error: 'Required param(s) missing.' })

	const browser = await puppeteer.launch({ defaultViewport: null })
	const page = await browser.newPage()

	if (req.query.darkMode)
		await page.emulateMediaFeatures([{
			name: 'prefers-color-scheme', value: 'dark'
		}]);

	try {
		await page.setViewport({
			width: parseInt(req.query.w),
			height: parseInt(req.query.h)
		})

		if (req.query.cookie)
			await page.setCookie({
				url: decodeURIComponent(req.query.url),
				name: JSON.parse(req.query.cookie).key,
				value: JSON.parse(req.query.cookie).val
			})

		await page.goto(decodeURIComponent(req.query.url))
		const screenshotBuffer = await page.screenshot()
		const screenshot = screenshotBuffer.toString('base64')

		/* res.writeHead(200, {
			'Content-Type': 'text/plain',
			'Content-Length': screenshot.length
		}) */
		res.send(screenshot)

	} catch (err) {
		console.error(err)
	}

	await browser.close()
})

app.listen(process.env.PORT)