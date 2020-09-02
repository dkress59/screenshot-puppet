const puppeteer = require('puppeteer')
const express = require('express')
const bodyParser = require('body-parser')
//const morgan = require('morgan')
const redis = require('redis')
const util = require('util')
const shell = require('shelljs')

const PORT = process.env.PUPPET_PORT || 80
const REDIS = process.env.PUPPET_REDIS || 'redis://127.0.0.1:6379'
const ALLOW_ACCESS = process.env.PUPPET_ACCESS || '*'
const PULL = process.env.PUPPET_PULL || null


const app = express()
const client = redis.createClient(REDIS)
client.get = util.promisify(client.get)
client.setex = util.promisify(client.setex)

const headers = (req, res, next) => {
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	res.header("Access-Control-Allow-Origin", ALLOW_ACCESS)
	//res.header("Cache-Control", "private, max-age=" + 60*60*24 * 30)
	res.header("Cache-Control", "private, max-age=1")
	res.type('application/json')
	next()
}

const update = (req, res) => {
	if (req.query.v === 'fe') {

		shell.cd('/var/www/dkress-mmxx')
		if (shell.exec('/var/www/dkress-mmxx/update.sh').code !== 0) {
			res.status(500).send({ error: 'Update failed.' })
		} else {
			res.send({ message: 'Update complete.' })
			shell.exec('/usr/local/bin/pm2 restart DK20')
		}

	} else {

		shell.cd('/var/www/screenshot-puppet')
		if (shell.exec('/var/www/screenshot-puppet/update.sh').code !== 0) {
			res.status(500).send({ error: 'Update failed.' })
		} else {
			res.send({ message: 'Update complete.' })
			shell.exec('/usr/local/bin/pm2 restart screenshot-puppet')
		}

	}
}

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


app.use(headers)
//app.use(morgan('tiny'))
app.use(bodyParser.json())
app.use('/update', update)
app.use(cache)


app.get('/', async (req, res) => {

	const { w, h, link, title, url, darkMode } = req.query
	const remove = (req.query.remove && req.query.remove !== undefined && req.query.remove !== 'undefined')
		? JSON.parse(req.query.remove)
		: false

	const browser = await puppeteer.launch({
		timeout: 666,
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

		await page.goto(
			decodeURIComponent(url),
			//{ waitUntil: 'load' },
		)

		//await page.waitForNavigation({ waitUntil: 'load' })
		//page.waitFor(222)

		if (remove)
			remove.map(sel => {
				console.log('remove', sel)
				try {
					page.evaluate(sel => {
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
			const { w, h, link, title, url, darkMode } = image
			/* const cookie = req.query.cookie
				? JSON.parse(req.query.cookie)
				: false */

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

				/* if (cookie && Object.entries(cookie).length)
					await page.setCookie({
						url: decodeURIComponent(url),
						name: cookie.key,
						value: cookie.val
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
			res.status(500).send(JSON.stringify({ error: err }))
			//browser.close()
		})
		.finally(() => {
			console.log('closing browser...')
			browser.close().catch(e => void e)
		})

	//browser.close()

})


app.use('/', (req, res) => {
	return res.status(400).send({ error: 'GET forbidden for this route.' })
})


app.listen(PORT)