import { PuppetOptions } from '../PuppetOptions'
import { Request, Response } from 'express'
import { Screenshot } from '../util/Screenshot'
import { launchBrowser, makeScreenshot } from './browser'
import { logErrorToConsole, logToConsole } from '../util/utils'
import queryString from 'query-string'

const makeOriginURL = (req: Request, options?: PuppetOptions) => options?.return_url
	? `${options.return_url}${req.path}${req.params?.filename ?? ''}${
		req.query
			? '?' + queryString.stringify(req.query as Record<string, string>)
			: ''
	}`
	: `${req.protocol}://${req.get('host') ?? 'localhost'}${req.originalUrl}`

interface PuppetBody { cached: Screenshot[], needed: Screenshot[] }

export const getScreenshotRoute = async (req: Request, res: Response, options?: PuppetOptions): Promise<void> => {
		
	const image = new Screenshot(req, options)
	
	const browser = await launchBrowser(res)
	
	const response = await makeScreenshot(browser, image, options?.screenshot)
	
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
	
	logToConsole('closing browser...')
	await browser.close()
}

export const postScreenshotRoute = async (req: Request, res: Response, options?: PuppetOptions): Promise<void> => {

	res.type('json')

	const { cached, needed }: PuppetBody = 'cached' in req.body && 'needed' in req.body
		? req.body as PuppetBody
		: {
			cached: [],
			needed: req.body as Screenshot[]
		}
	const browser = await launchBrowser(res)

	const returns: Screenshot[] = []
	const errors: Screenshot[] = []
	for await (const query of needed) {
		const img = new Screenshot({ query, path: req.path } as unknown as Request, options)
		try {

			const response = await makeScreenshot(browser, img, options?.screenshot)
			if (response.src)
				returns.push(response)
			else
				errors.push(response)

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
			
	logToConsole('closing browser...')
	browser.close().catch((error: Error) => void error)
}
