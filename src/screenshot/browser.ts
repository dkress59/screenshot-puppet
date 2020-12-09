import { Response } from 'express'
import { Screenshot } from '../util/Screenshot'
import { logErrorToConsole, logToConsole } from '../util/utils'
import puppeteer, { Browser, LaunchOptions, PDFOptions, ScreenshotOptions } from 'puppeteer'


const qualities = new Set([
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
])

export const launchBrowser = async (res?: Response, options?: LaunchOptions): Promise<Browser> => {
	process.setMaxListeners(16) // ToDo: options?
	return await puppeteer
		.launch({
			timeout: 6666,
			defaultViewport: null,
			ignoreHTTPSErrors: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'], // ToDo: neccessary?
			...options,
			headless: true,
		})
		.catch( /* istanbul ignore next */ (error) => {
			if (res)
				res
					.status(500)
					.send({
						message: 'error launching puppeteer',
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
						error: error.message,
					})

			throw new Error('error launching puppeteer: ' + JSON.stringify(error)) // breaks jest
		})
}


// eslint-disable-next-line sonarjs/cognitive-complexity
export const makeScreenshot = async (browser: Browser, image: Screenshot, options?: ScreenshotOptions | PDFOptions): Promise<Screenshot> => {

	const { w, h, url, darkMode, remove, output } = image

	const encoding = (output === 'bin')
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
			&& 'quality' in options
			&& options.quality !== undefined
			&& qualities.has(options.quality)
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
					/* istanbul ignore next */
					await page.evaluate((sel) => {
						const nodes = document.querySelectorAll(sel)
						if (document.querySelectorAll(sel).length)
							for (let i = 0; i < nodes.length; i++)
								// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
								nodes[i].remove()
					}, sel)
				} catch (error) {
					image.errors.push(error)
					logErrorToConsole(error)
				}
			}

		const screenshot = (output === 'pdf')
			? await page.pdf(safeOptions)
			: await page.screenshot(safeOptions)

		image.src = screenshot

	} catch (error) {

		logToConsole(error)
		image.errors.push(error)

	}


	return image

}
