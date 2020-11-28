import puppeteer, { Browser, PDFOptions, ScreenshotOptions } from 'puppeteer'
import { Response } from 'express'
import { logErrorToConsole, logToConsole } from '../util/utils'
import { Screenshot } from '../types/Screenshot'


const qualities = [
	0,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
	16,
	17,
	18,
	19,
	20,
	21,
	22,
	23,
	24,
	25,
	26,
	27,
	28,
	29,
	30,
	31,
	32,
	33,
	34,
	35,
	36,
	37,
	38,
	39,
	40,
	41,
	42,
	43,
	44,
	45,
	46,
	47,
	48,
	49,
	50,
	51,
	52,
	53,
	54,
	55,
	56,
	57,
	58,
	59,
	60,
	61,
	62,
	63,
	64,
	65,
	66,
	67,
	68,
	69,
	70,
	71,
	72,
	73,
	74,
	75,
	76,
	77,
	78,
	79,
	80,
	81,
	82,
	83,
	84,
	85,
	86,
	87,
	88,
	89,
	90,
	91,
	92,
	93,
	94,
	95,
	96,
	97,
	98,
	99,
	100
]


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


export const makeScreenshot = async (browser: Browser, image: Screenshot, options?: ScreenshotOptions | PDFOptions): Promise<Screenshot> => {

	const { w, h, url, darkMode, remove, output } = image

	const encoding = (output === 'bin') || (
		output === 'json'
		&& options
		&& 'encoding' in options
		&& options.encoding === 'binary'
	)
		? 'binary'
		: 'base64'
	
	const type = options && ('type' in options)
		? options.type
		: output === 'pdf'
			? undefined
			: output === 'jpg'
				? 'jpeg'
				: 'png'

	const quality = (
		options
			&& ('quality' in options)
			&& options.quality !== undefined
			&& qualities.indexOf(options.quality)
	)
		? options.quality
		: undefined

	const safeOptions: ScreenshotOptions | PDFOptions = {
		...options,
		encoding,
		path: undefined, // can save to disk
		type,
		quality,
	}

	try {

		const page = await browser.newPage()
		await page.setViewport({ width: w, height: h })

		if (darkMode)
			await page.emulateMediaFeatures([{
				name: 'prefers-color-scheme',
				value: 'dark',
			}])

		await page.goto(url, {
			waitUntil: 'networkidle0'
		})

		if (remove)
			for (const sel of remove) {
				logToConsole('remove', sel)
				try {
					page.evaluate((sel) => {
						const nodes = document.querySelectorAll(sel)
						if (document.querySelectorAll(sel).length)
							for (let i = 0; i < nodes.length; i++)
								nodes[i].parentNode.removeChild(nodes[i])
					}, sel)
				} catch (error) {
					image.errors.push(error)
					logErrorToConsole(error)
				}
			}

		const screenshot = (output === 'pdf')
			? await page.pdf(safeOptions)
			: await page.screenshot(safeOptions)

		image.src = screenshot // ToDo: test b64/bin + pdf / return string

	} catch (error) {

		logToConsole(error)
		image.errors.push(error)

	}


	return image

}
