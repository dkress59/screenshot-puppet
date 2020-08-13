#!/usr/bin/env node
const puppeteer = require('puppeteer')
const express = require('express')
const bodyParser = require('body-parser')
//const morgan = require('morgan')
const redis = require('redis')
const util = require('util')

const app = express()
const client = redis.createClient(process.env.REDIS_PORT)
client.get = util.promisify(client.get)
client.setex = util.promisify(client.setex)

const cache = async (req, res, next) => {

	if (req.method !== 'POST')
		return next()
	if (!req.body || req.body == {})
		return res.status(402).send({ error: 'Nothing passed in the request body.' })

	const needed = []
	const cached = []
	for await (const image of req.body) {
		const cacheId =
			new Date().getFullYear().toString()
			+ '-' + new Date().getMonth().toString()
			+ `-${image.link}-${req.body.w}x${req.body.h}`

		try {
			const isCached = await client.get(cacheId)
			if (isCached && isCached.length) {
				console.log('cached')
				cached.push({ src: isCached, link: image.link })
			}
			else {
				console.log('needed', isCached)
				needed.push(image)
			}
		} catch (err) { console.error(err) }
	}

	console.log(needed.length, cached.length)

	if (cached.length === req.body.length) {
		return res.send(JSON.stringify(cached))
	}

	req.body = { cached, needed }
	next()

}

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	res.header("Access-Control-Allow-Origin", process.env.ALLOW_ACCESS)
	//res.header("Cache-Control", "private, max-age=2592000")
	res.type('application/json')
	next()
})
app.use(bodyParser.json())
//app.use(morgan('tiny'))
app.use(cache)

app.get('/', (req, res) => {
	return res.status(402).send({ error: 'GET forbidden temporarily.' })

		(async () => {

			/*	const browser = await puppeteer.launch({
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
						decodeURIComponent(req.query.url)
					)
		
					await browser.close()
		
					const screenshotBuffer = await page.screenshot()
					const screenshot = screenshotBuffer.toString('base64')
		
					res.end(JSON.stringify({ img: screenshot }))
		
				}
		
				catch (err) {
					res.status(402).send(JSON.stringify({ error: err }))
					console.log(err)
				}
		
				finally {
					//await browser.close()
				}*/

		})()

})


app.post('/', async (req, res) => {
	const { cached, needed } = req.body

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
	for (const image of needed)
		returns.push((async () => {

			try {

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
				const cacheId =
					new Date().getFullYear().toString()
					+ '-' + new Date().getMonth().toString()
					+ `-${image.link}-${needed.w}x${needed.h}`

				await client.setex(cacheId, 60 * 60 * 24 * 30, screenshot)
				return { src: screenshot, link: image.link }

			}

			catch (err) {
				console.log(err)
				return { error: err, url: image.url, link: image.link }
			}

		})())

	Promise.all(returns)
		.then(images => {
			res.send(JSON.stringify([...cached, ...images]))
			//browser.close()
		})
		.catch(err => {
			res.status(402).send(JSON.stringify({ error: err }))
			//browser.close()
		})
		.finally(() => {
			console.log('closing browser...')
			browser.close().catch(e => void e)
		})

	//browser.close()

})

app.listen(process.env.PORT)