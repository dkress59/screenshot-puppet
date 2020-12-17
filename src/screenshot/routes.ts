import { Request, Response } from 'express'
import { logErrorToConsole, logToConsole } from '../util/utils'
import { launchBrowser, makeScreenshot } from './browser'
import { Screenshot } from '../util/Screenshot'
import { ShotOptions } from '../types'
import queryString from 'query-string'
import { Browser } from 'puppeteer'

const makeOriginURL = (req: Request, options?: ShotOptions) => options?.return_url
	? `${options.return_url}${req.path}${req.params?.filename ?? ''}${
		req.query
			? '?' + queryString.stringify(req.query as Record<string, string>)
			: ''
	}`
	: req.protocol + '://' + req.get('host') + req.originalUrl

export async function getScreenshotRoute(req: Request, res: Response, options?: ShotOptions): Promise<void> {

	const cacheSuccess = options?.middleware && await options.middleware(req, res)
	if (cacheSuccess === false) return

	const image = new Screenshot(req, options)
	if (cacheSuccess) image.src = cacheSuccess

	const browser = cacheSuccess ? {} as Browser : await launchBrowser(res)
	
	const response = cacheSuccess ? image : await makeScreenshot(browser, image, options?.screenshot)
	
	if (options?.callback) options.callback(response)
	
	switch(response.output) {
		case 'bin':
			break
		case 'jpg':
			res.type('jpg')
			break
		case 'pdf':
			res.type('pdf')
			break
		case 'png':
			res.type('png')
			break
		default:
			res.type('json')
			break
	}
	
	const originalUrl = makeOriginURL(req, options)
	
	response.output === 'json'
		? res.status(200).send(JSON.stringify({ response, originalUrl }))
		: response.output === 'bin'
			? res.status(200).send(response.src)
			: res.status(200).send(Buffer.from(response.src as string, 'base64'))
	
	if (browser) {
		browser.close().catch((e: Error) => void e)
		logToConsole(`
			browser closed.
		`)
	}
	return
}

export async function postScreenshotRoute(req: Request, res: Response, options?: ShotOptions): Promise<void> {

	res.type('json')

	if (options?.middleware) await options.middleware(req, res)

	const { cached, needed } = req.body.cached && req.body.needed
		? req.body
		: {
			cached: [],
			needed: req.body
		}
	const browser = needed.length ? await launchBrowser(res) : {} as Browser

	const returns = []
	const errors = []
	for await (const query of needed) {
		const img = new Screenshot({ query, path: req.path } as Request, options)
		try {

			const response = await makeScreenshot(browser, img, options?.screenshot)
			returns.push(response)

		} catch (error) {

			img.errors.push(error)
			logErrorToConsole(error)
			errors.push(img)

		}
	}

	const originalUrl = makeOriginURL(req, options)
	const conditionalErrors = errors.length ? { errors } :  {}

	if (options?.callback) options.callback(returns)
	res.status(200).send(JSON.stringify({
		...conditionalErrors,
		originalUrl,
		response: [...cached, ...returns],
	}))

	if (browser) {
		browser.close().catch((e: Error) => void e)
		logToConsole(`
			browser closed.
		`)
	}
}
