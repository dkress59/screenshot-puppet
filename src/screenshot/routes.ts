import { Request, Response } from 'express'
import { logErrorToConsole, logToConsole } from '../util/utils'
import { launchBrowser, makeScreenshot } from './browser'
import { Screenshot } from '../util/Screenshot'
import { PuppetOptions } from '../PuppetOptions'
import queryString from 'query-string'

const makeOriginURL = (req: Request, options?: PuppetOptions) => options?.return_url
	? `${options.return_url}${req.path}${req.query
		? queryString.stringify(req.query as Record<string, string>)
		: null
	}`
	: req.originalUrl as string

export const getRouteScreenshot = async (req: Request, res: Response, options?: PuppetOptions): Promise<void> => {
		
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
	return
}

export const postRouteScreenshot = async (req: Request, res: Response, options?: PuppetOptions): Promise<void> => {

	res.type('json')

	const { cached, needed } = req.body.cached && req.body.needed
		? req.body
		: {
			cached: [],
			needed: req.body
		}
	const browser = await launchBrowser(res)

	const returns = []
	const errors = []
	for await (const image of needed)
		returns.push(
			(async () => {
				const img = new Screenshot(image)
				try {

					const response = await makeScreenshot(browser, img, options?.screenshot)
					if (response.src)
						return response
					else
						errors.push(response)

				} catch (error) {

					img.errors.push(error)
					logErrorToConsole(error)
					errors.push(img)

				}
			})()
		)

	const originalUrl = makeOriginURL(req, options)

	Promise.all(returns)
		.then((images) => {
			if (options?.callback) options.callback(images)
			res.status(200).send(JSON.stringify({
				request: req.body,
				response: [...cached, ...images],
				originalUrl,
			}))
		})
		.catch((err) => {
			if (options?.callback) options.callback(err)
			logErrorToConsole(err)
			res.status(500).send(JSON.stringify({ error: err }))
		})
		.finally(() => {
			logToConsole('closing browser...')
			browser.close().catch((e: Error) => void e)
		})
}
