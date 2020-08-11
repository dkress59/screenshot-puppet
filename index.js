const puppeteer = require('puppeteer')
const express = require('express')
const bodyParser = require('body-parser')
const { restart } = require('nodemon')
//const morgan = require('morgan')

const app = express()
//app.use(morgan("combined"))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	res.header("Access-Control-Allow-Origin", process.env.ALLOW_ACCESS)
	res.header("Cache-Control", "private, max-age=2592000")
	res.type('application/json')
	next()
})

app.get('/', (req, res) => {

	(async () => {

		const browser = await puppeteer.launch({
			timeout: 6666,
			handleSIGINT: false,
			defaultViewport: null,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox'
			]
		}).catch(e => void e)

		try {

			if (!req.query.url || !req.query.w || !req.query.h)
				throw 'Required param(s) missing.'

			const page = await browser.newPage()

			await page.setViewport({
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

			await browser.close()

			const screenshotBuffer = await page.screenshot()
			const screenshot = screenshotBuffer.toString('base64')

			res.end(JSON.stringify({ img: screenshot }))

		}

		catch (err) {
			res.status(500).end(JSON.stringify({ error: err }))
			console.log(err)
		}

		finally {
			//await browser.close()
		}

	})()
})


app.post('/', async (req, res) => {
	//(async () => {

	if (!req.body || req.body == {})
		return res.status(500).send({ error: 'Nothing passed in the request body.' })

	const browser = await puppeteer.launch({
		timeout: 6666,
		handleSIGINT: false,
		defaultViewport: null,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox'
		]
	}).catch(e => void e)

	const returns = []
	for (const image of req.body)
		returns.push((async () => {

			//	try {

			const page = await browser.newPage()

			await page.setViewport({
				width: parseInt(image.w),
				height: parseInt(image.h)
			})

			if (image.darkMode)
				await page.emulateMediaFeatures([{
					name: 'prefers-color-scheme', value: 'dark'
				}])

			if (image.cookie.length > 2)
				await page.setCookie({
					url: decodeURIComponent(image.url),
					name: JSON.parse(image.cookie).key,
					value: JSON.parse(image.cookie).val
				})

			await page.goto(
				decodeURIComponent(image.url)
			)

			const screenshotBuffer = await page.screenshot()
			const screenshot = screenshotBuffer.toString('base64')

			return { src: screenshot, link: image.link }

			//	}

			/* catch (err) {
				res.status(500).end(JSON.stringify({ error: err }))
				console.log(err)
			} */

		})())

	Promise.all(returns)
		.then(images => {
			res.status(200).send(JSON.stringify(images))
			console.log('closing browser...', JSON.stringify(images).length)
			//browser.close()
		})
		.catch(err => {
			res.status(500).send(JSON.stringify({ error: err }))
			//browser.close()
		})
		.finally(() => {
			browser.close().catch(e => void e)
		})

	//browser.close()

	//)()
})

app.listen(process.env.PORT)