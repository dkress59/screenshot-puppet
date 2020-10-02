import util from 'util'
import puppeteer, { Browser } from 'puppeteer'
import { Response } from 'express'
import Screenshot from '../types/Screenshot'
import { logErrorToConsole, logToConsole } from './utils'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const redis = require('redis')
const REDIS = process.env.PUPPET_REDIS || 'redis://127.0.0.1:6379'


export const client = redis.createClient(REDIS)
client.get = util.promisify(client.get)
client.set = util.promisify(client.set)
client.setex = util.promisify(client.setex)
client.exists = util.promisify(client.exists)


export const launchBrowser = async (res?: Response, timeout?: number): Promise<Browser> => {
	process.setMaxListeners(16)
	const browser = await puppeteer
		.launch({
			timeout: timeout ? timeout : 6666,
			defaultViewport: null,
			ignoreHTTPSErrors: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'], // ToDo: neccessary?
		})
		.catch((e) => {
			if (res)
				res
					.status(500)
					.send({ error: 'error launching puppeteer: ' + e.toString() })
			throw new Error('error launching puppeteer: ' + e.toString())
		})

	return browser
}


export const makeScreenshot = async (browser: Browser, image: Screenshot): Promise<Screenshot> => {
	const { width, height, link, url, darkMode, remove } = image
	if (!link) image.error = 'No link provided for the screen shot.'
	if (!link) return image

	try {

		const page = await browser.newPage()
		if (width && height) await page.setViewport({ width, height })

		if (darkMode)
			await page.emulateMediaFeatures([{
				name: 'prefers-color-scheme',
				value: 'dark',
			}])

		await page.goto(url)

		if (remove)
			remove.map((sel: string) => {
				logToConsole('remove', sel)
				try {
					page.evaluate((sel) => {
						const nodes = document.querySelectorAll(sel)
						if (document.querySelectorAll(sel).length)
							for (let i = 0; i < nodes.length; i++)
								nodes[i].parentNode.removeChild(nodes[i])
					}, sel)
				} catch (error) {
					//image.error = error
					logErrorToConsole(error)
				}
				return
			})

		const screenshot = await page.screenshot()
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		image.source = screenshot.toString('base64') // ToDo: Why isn't btoa() working?

		const cacheId = `${link}-${width}x${height}`
		await client.setex(cacheId, 60 * 60 * 24 * 30, image.source)
		logToConsole(`cache set for ${cacheId}`)

	} catch (error) {

		logToConsole(error)
		image.error = error

	}
	return image
}

export const makePDF = async (doc: string): Promise<false | Buffer> => {
	const path = process.env.LV_REACT_APP_URL + '/invoice/' + doc
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

	const browser = await launchBrowser()
	const page = await browser.newPage()

	try {

		await page.goto(path, { waitUntil: 'domcontentloaded' })
		await page.setCookie(...cookies)
		await page.reload({ waitUntil: 'networkidle2' })
		await page.emulateMediaType('screen')// ToDo: 'print'

		const file = await page.pdf({ format: 'A4' })
		await client.setex(`lv-pdf/${doc}`, 60 * 60 * 24 * 30, file.toString('base64'))

		await browser.close()
		return file

	} catch (err) {

		logErrorToConsole(err)
		await browser.close()
		return false

	}
}
