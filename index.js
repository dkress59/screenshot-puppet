const puppeteer = require('puppeteer')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Credentials", "true")
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization, xhrFields"
	)
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'OPTIONS, PUT, POST, PATCH, DELETE, GET')
		return res.status(200).json({})
	}
	next()
})

app.get('/', async (req, res) => {
	const browser = await puppeteer.launch({ defaultViewport: null })
	const page = await browser.newPage()
	await page.setViewport({
		width: parseInt(req.query.w),
		height: parseInt(req.query.h)
	})
	await page.goto(decodeURIComponent(req.query.url)) // URL is given by the "user" (your client-side application)
	const screenshotBuffer = await page.screenshot()

	// Respond with the image
	res.writeHead(200, {
		'Content-Type': 'image/png',
		'Content-Length': screenshotBuffer.length
	})
	res.end(screenshotBuffer)
	//res.json([screenshotBuffer.toString()])

	await browser.close()
})

app.post('/', async (req, res) => {

	const w = (req.body.length && parseInt(req.body.w) > 0) ? parseInt(req.body.w) : 0
	const h = (req.body.length && parseInt(req.body.h) > 0) ? parseInt(req.body.h) : 0
	//if (!w || !h) return null

	const browser = await puppeteer.launch({ defaultViewport: null })
	const page = await browser.newPage()

	await page.setViewport({
		width: parseInt(req.body.w),
		height: parseInt(req.body.h)
	})

	const screenshots = async () => {
		const screenshots = []
		for (let i = 0; i < req.body.urls.length; i++) {
			//console.log(decodeURIComponent(req.body.urls[i].url))
			if (!req.body.urls[i].url !== '') {
				await page.goto(decodeURIComponent(req.body.urls[i].url))
				await page.evaluate()
				const screenshotBuffer = await page.screenshot()

				screenshots.push({
					link: req.body.urls[i].link,
					img: screenshotBuffer.toString()
				})
			}
		}
		return Promise.all(screenshots)
	}

	screenshots()
		.then(shots => {
			console.log(shots)
			res.writeHead(200, {
				'Content-Type': 'application/json',
			})
			res.send(shots)
		})
		.catch(err => res.status(500).end({ error: err }))

	await browser.close()
})

app.listen(4848)