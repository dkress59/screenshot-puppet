const puppeteer = require('puppeteer')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", process.env.ALLOW_ACCESS)
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	next()
})

app.get('/', (req, res) => {

	/* process.on("unhandledRejection", (reason, p) => {
		console.error("Unhandled Rejection at: Promise", p, "reason:", reason)
		browser.close()
		return res.send({ error: reason })
	}) */

	(async () => {

		try {

			if (!req.query.url || !req.query.w || !req.query.h)
				throw 'Required param(s) missing.'

			const browser = await puppeteer.launch({
				defaultViewport: null,
				args: [
					'--no-sandbox',
					'--disable-setuid-sandbox'
				]
			})/* .catch(err => {
				browser.close()
				res.status(500).send({ error: err })
			}) */
			const page = await browser.newPage()

			page.setViewport({
				width: parseInt(req.query.w),
				height: parseInt(req.query.h)
			})

			if (req.query.darkMode)
				await page.emulateMediaFeatures([{
					name: 'prefers-color-scheme', value: 'dark'
				}])

			if (req.query.cookie.length > 2)
				await page.setCookie({
					url: decodeURIComponent(req.query.url),
					name: JSON.parse(req.query.cookie).key,
					value: JSON.parse(req.query.cookie).val
				})

			await page.goto(
				decodeURIComponent(req.query.url)/* ,
			{ waitUntil: 'domcontentloaded' } */
			)
			const screenshotBuffer = await page.screenshot()
			const screenshot = screenshotBuffer.toString('base64')

			await browser.close()
			//return screenshot
			return res.send({ img: screenshot })

		} catch (err) {
			console.error(err)
			await browser.close()
			return res.status(500).send({ error: err })
			//return new Error(err)
		}

	})()
})

app.listen(process.env.PORT)