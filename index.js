const puppeteer = require('puppeteer')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	res.header("Access-Control-Allow-Origin", process.env.ALLOW_ACCESS)
	res.header("Cache-Control", "private, max-age=2592000")
	res.type('application/json')
	next()
})

app.get('/', async (req, res) => {

	const browser = await puppeteer.launch({
		defaultViewport: null,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox'
		]
	}).catch((e) => void e)

	try {

		if (!req.query.url || !req.query.w || !req.query.h)
			throw 'Required param(s) missing.'

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
		return res.send({ img: screenshot })

	} catch (err) {
		res.status(500).send({ error: err })
		console.log(err)
		await browser.close()
		return //res.status(500).send({ error: err })
		//return new Error(err)
	}

})

app.listen(process.env.PORT)