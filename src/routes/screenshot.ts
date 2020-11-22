import { Request, Response } from 'express'
import { logErrorToConsole, logToConsole } from '../util/utils'
import { launchBrowser, makeScreenshot } from '../util/browser'
import { SCOptions, Screenshot } from '../types/Screenshot'

export const postRouteScreenshot = async (req: Request, res: Response): Promise<void> => {

	res.type('application/json')
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { cached, needed } = req.body
	const browser = await launchBrowser(res)

	const returns = []
	const errors = []
	for await (const image of needed)
		returns.push(
			(async () => {
				try {

					const response = await makeScreenshot(browser, image)
					if (response.src)
						return response
					else
						errors.push(response)

				} catch (error) {

					console.error(error)
					errors.push({
						...image,
						error,
					})

				}
			})()
		)

	Promise.all(returns)
		.then((images) => {
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

export const getRouteScreenshot = async (req: Request, res: Response): Promise<void> => {
	res.type('application/json')
	
	const image = new Screenshot(req)

	const browser = await launchBrowser(res)

	const customOptions: SCOptions = image.output === 'jpg'
		? { type: 'jpeg'}
		: {}
	const response = await makeScreenshot(browser, image, customOptions)

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
