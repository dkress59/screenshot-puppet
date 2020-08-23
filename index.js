#!/usr/bin/env node
const puppeteer = require('puppeteer')
const express = require('express')
const bodyParser = require('body-parser')
//const morgan = require('morgan')
const redis = require('redis')
const util = require('util')

const PORT = process.env.PORT || 80
const REDIS = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const ALLOW_ACCESS = process.env.ALLOW_ACCESS || '*'

const app = express()
const client = redis.createClient(REDIS)
client.get = util.promisify(client.get)
client.setex = util.promisify(client.setex)

const cache = async (req, res, next) => {

	if (req.method !== 'POST' && req.method !== 'GET')
		return next()

	switch (req.method) {
		default:
			next()
			break

		case 'POST':
			if (!req.body || req.body == {})
				return res.status(402).send({ error: 'Nothing passed in the request body.' })

			const needed = []
			const cached = []
			for await (const image of req.body) {
				const cacheId = `${image.link}-${image.w}x${image.h}`
				try {
					const isCached = await client.get(cacheId)
					if (isCached && isCached.length) {
						console.log('cached', cacheId)
						cached.push({ src: isCached, link: image.link, title: image.title })
					} else {
						console.log('needed', cacheId)
						needed.push(image)
					}
				} catch (err) {
					console.error(err)
					needed.push(image)
				}
			}
			if (!needed.length)
				return res.send(JSON.stringify(cached))
			res.body = { cached, needed }
			next()
			break

		case 'GET':
			const image = req.query
			const cacheId = `${image.link}-${image.w}x${image.h}`
			try {
				const isCached = await client.get(cacheId)
				if (isCached && isCached.length) {
					console.log('cached', cacheId)
					return res.send(JSON.stringify({ src: isCached, link: image.link, title: image.title }))
				} else {
					console.log('needed', cacheId)
				}
			} catch (err) {
				console.error(err)
			}
			next()
			break

	}
}

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	res.header("Access-Control-Allow-Origin", ALLOW_ACCESS)
	//res.header("Cache-Control", "private, max-age=2592000")
	res.header("Cache-Control", "private, max-age=1")
	res.type('application/json')
	next()
})
app.use(bodyParser.json())
//app.use(morgan('tiny'))
app.use(cache)

app.get('/api/', async (req, res) => {
	//return res.status(402).send({ error: 'GET forbidden temporarily.' })

	const image = req.query
	/* if (!image.length)
		return res.status(402).send({ error: 'Required param(s) missing.' }) */

	const browser = await puppeteer.launch({
		//timeout: 6666,
		//handleSIGINT: false,
		defaultViewport: null,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox'
		]
	}).catch(e => (res.status(500).send({ error: 'error launching puppeteer: ' + e })))


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

		/* if (image.cookie.length > 2)
			await page.setCookie({
				url: decodeURIComponent(image.url),
				name: JSON.parse(image.cookie).key,
				value: JSON.parse(image.cookie).val
			}) */

		await page.goto(
			decodeURIComponent(image.url)
		)

		const screenshotBuffer = await page.screenshot()
		const screenshot = screenshotBuffer.toString('base64')
		const cacheId = `${image.link}-${image.w}x${image.h}`

		console.log(`set cache ${cacheId}`)
		await client.setex(cacheId, 60 * 60 * 24 * 30, screenshot)
		res.send(JSON.stringify({ src: screenshot, link: image.link, title: image.title }))

	}

	catch (err) {
		console.log(err)
		res.send(JSON.stringify({ error: err, url: image.url, link: image.link, title: image.title }))
	}

	console.log('closing browser...')
	await browser.close().catch(e => void e)
	return

})


app.post('/api/', async (req, res) => {
	const { cached, needed } = req.body

	const browser = await puppeteer.launch({
		timeout: 6666,
		//handleSIGINT: false,
		defaultViewport: null,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox'
		]
	}).catch(e => (res.status(500).send({ error: 'error launching puppeteer: ' + e })))

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

				/* if (image.cookie.length > 2)
					await page.setCookie({
						url: decodeURIComponent(image.url),
						name: JSON.parse(image.cookie).key,
						value: JSON.parse(image.cookie).val
					}) */

				await page.goto(
					decodeURIComponent(image.url)
				)

				const screenshotBuffer = await page.screenshot()
				const screenshot = screenshotBuffer.toString('base64')
				const cacheId = `${image.link}-${image.w}x${image.h}`

				console.log(`set cache ${cacheId}`)
				await client.setex(cacheId, 60 * 60 * 24 * 30, screenshot)
				return { src: screenshot, link: image.link, title: image.title }

			}

			catch (err) {
				console.log(err)
				return { error: err, url: image.url, link: image.link, title: image.title }
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

app.use('/', (req, res) => {
	return res.status(402).send({ error: 'GET forbidden for this route.' })
})

app.listen(PORT)