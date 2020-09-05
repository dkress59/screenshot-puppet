import util from 'util'
const redis = require('redis')
const REDIS = process.env.PUPPET_REDIS || 'redis://127.0.0.1:6379'

export const client = redis.createClient(REDIS)
client.get = util.promisify(client.get)
client.setex = util.promisify(client.setex)

import puppeteer, { Browser } from 'puppeteer'
import { Response } from 'express'

export const launchBrowser = async (res?: Response): Promise<Browser> => {
	const browser = await puppeteer
		.launch({
			timeout: 666,
			defaultViewport: null,
			ignoreHTTPSErrors: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'], // ToDo: neccessary?
		})
		.catch((e: any) => {
			if (res)
				res
					.status(500)
					.send({ error: 'error launching puppeteer: ' + e.toString() })
			throw new Error('error launching puppeteer: ' + e.toString())
		})

	return browser
}

import Screenshot from '../types/Screenshot'
export const makeScreenshot = async (browser: Browser, image: Screenshot) => {
	const { width, height, link, title, url, darkMode, remove } = image

	try {
		const page = await browser.newPage()

		if (width && height) await page.setViewport({ width, height })

		if (darkMode)
			await page.emulateMediaFeatures([
				{
					name: 'prefers-color-scheme',
					value: 'dark',
				},
			])

		await page.goto(url)

		if (remove)
			remove.map((sel: string) => {
				console.log('remove', sel)
				try {
					page.evaluate((sel) => {
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
		//@ts-ignore
		const src = screenshot.toString('base64') // ToDo: Why isn't btoa() working?
		image.source = src

		const cacheId = `${link}-${width}x${height}`
		await client.setex(cacheId, 60 * 60 * 24 * 30, src)
		console.log(`cache set for ${cacheId}`)
		//return { src, link, title };
	} catch (error) {
		console.log(error)
		image.error = error
		//return { error, link, title, url };
	}
	return image
}

export const makePDF = async (doc: string) => {
	const path = doc ? process.env.LV_REACT_APP_URL + '/invoice/' + doc : null
	const cookies = [{
		name: 'allowCookies',
		value: 'true',
		path: '/',
		expires: -1,
	}, {
		name: 'ageIsVerified',
		value: 'true',
		path: '/',
		expires: -1,
	}]

	if (!path) return false

	const browser = await launchBrowser()
	const page = await browser.newPage()

	try {
		await page.goto(path)
		await page.setCookie(...cookies)

		await page.reload({ waitUntil: 'networkidle2' })
		//await page.addStyleTag({ path: process.env.LV_REACT_APP_URL + '/print.css' })// ToDo: @media print

		//await page.waitFor(1600)
		await page.emulateMediaType('screen')// ToDo: 'print'
		const file = await page.pdf({
			path: `pdf/${doc}`,
			format: 'A4',
		})

		await browser.close()
		return true
		return file
	}
	catch (err) {
		console.error(err)
		await browser.close()
		return false
	}
}
