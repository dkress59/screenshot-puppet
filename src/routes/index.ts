import { Request, Response } from 'express'
import { logErrorToConsole, logToConsole } from '../util/utils'
import { launchBrowser, makeScreenshot } from '../util/browser'
import { Screenshot } from '../types/Screenshot'
import { PuppetOptions } from '../types/PuppetOptions'

/**
 * * output – source of truth
 * - default
 * - type
 * - init
 * - request
*/

export const postRouteScreenshot = async (req: Request, res: Response, options?: PuppetOptions): Promise<void> => {

	res.type('application/json')
	const { cached, needed } = req.body
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

					img.error = error
					logErrorToConsole(error)
					errors.push(img)

				}
			})()
		)

	Promise.all(returns)
		.then((images) => {
			if (options?.callback) options.callback(images)
			if (images.filter((i) => i && i.error !== undefined).length)
				res.status(200).send(JSON.stringify([...cached, ...images]))
		})
		.catch((err) => {
			logErrorToConsole(err)
			res.status(500).send(JSON.stringify({ error: err }))
		})
		.finally(() => {
			logToConsole('closing browser...')
			browser.close().catch((e: Error) => void e)
		})
}

export const getRouteScreenshot = async (req: Request, res: Response, options?: PuppetOptions): Promise<void> => {
	res.type('application/json')
	
	const image = new Screenshot(req)

	const browser = await launchBrowser(res)

	const response = await makeScreenshot(browser, image, options?.screenshot)

	if (options?.callback) options.callback(response)

	response.src
		? res.status(200).send(JSON.stringify(response))
		: image.error.length
			? res.status(500).send(JSON.stringify(response))
			: res.status(500).send(
				JSON.stringify({
					...image,
					error: 'Error while retreiving screen shot.',
				})
			)

	logToConsole('closing browser...')
	await browser.close()
	return
}