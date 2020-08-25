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
			if (!needed || !needed.length || cached.length === req.body.length)
				return res.send(JSON.stringify(cached))

			req.body = { cached, needed }
			next()
			break

		case 'GET':
			const image = req.query
			if (!image || !Object.entries(req.query).length)
				return res.status(400).send({ error: 'Required param(s) missing.' })

			const { w, h, link, title } = image
			const cacheId = `${link}-${w}x${h}`
			try {
				const src = await client.get(cacheId)
				if (src && src.length) {
					console.log('cached', cacheId)
					return res.send(JSON.stringify({ src, link, title }))
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
	//res.header("Cache-Control", "private, max-age=" + 60*60*24 * 30)
	res.header("Cache-Control", "private, max-age=1")
	res.type('application/json')
	next()
})
app.use(bodyParser.json())
//app.use(morgan('tiny'))
app.use(cache)


app.get('/', async (req, res) => {

	const { w, h, link, title, url, darkMode, cookie } = req.query
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
			width: parseInt(w),
			height: parseInt(h)
		})

		if (darkMode)
			await page.emulateMediaFeatures([{
				name: 'prefers-color-scheme', value: 'dark'
			}])

		/* console.log(cookie)
		if (cookie && cookie.length > 2)
			await page.setCookie({
				url: decodeURIComponent(url),
				name: JSON.parse(cookie).key,
				value: JSON.parse(cookie).val
			})
 */
		await page.goto(
			decodeURIComponent(url)
		)

		const screenshot = await page.screenshot()
		const src = screenshot.toString('base64')
		const cacheId = `${link}-${w}x${h}`

		console.log(`set cache ${cacheId}`)
		await client.setex(cacheId, 60 * 60 * 24 * 30, src)
		res.send(JSON.stringify({ src, link, title }))

	}

	catch (error) {

		console.log(error)
		res.send(JSON.stringify({ error, link, title, url }))

	}


	console.log('closing browser...')
	await browser.close().catch(e => void e)
	return

})


app.post('/', async (req, res) => {
	const { cached, needed } = req.body
	console.log('next', needed.length)
	if (!needed || !needed.length)//ToDo: fix this
		return res.send(JSON.stringify(cached))

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
			const { w, h, link, title, url, darkMode, cookie } = image

			try {

				const page = await browser.newPage()

				await page.setViewport({
					width: parseInt(w),
					height: parseInt(h)
				})

				if (darkMode)
					await page.emulateMediaFeatures([{
						name: 'prefers-color-scheme', value: 'dark'
					}])

				/* if (cookie.length > 2)
					await page.setCookie({
						url: decodeURIComponent(url),
						name: JSON.parse(cookie).key,
						value: JSON.parse(cookie).val
					}) */

				await page.goto(
					decodeURIComponent(url)
				)

				const screenshot = await page.screenshot()
				const src = screenshot.toString('base64')
				const cacheId = `${link}-${w}x${h}`

				console.log(`set cache ${cacheId}`)
				await client.setex(cacheId, 60 * 60 * 24 * 30, src)
				return { src, link, title }

			}

			catch (error) {
				console.log(error)
				return { error, url, link, title }
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