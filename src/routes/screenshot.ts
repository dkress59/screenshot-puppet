import { Response } from 'express'
import Screenshot from '../types/Screenshot'
import { logErrorToConsole, logToConsole } from '../util/utils'
import ParsedQuery from '../types/ParsedQuery'
import { launchBrowser, makeScreenshot } from '../util/browser'

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
					if (response.source)
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
	
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const image = new Screenshot(new ParsedQuery(req))
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	image.remove = req.query.remove.split(',')

	const browser = await launchBrowser(res)

	const response = await makeScreenshot(browser, image)
	response.source
		? res.status(200).send(JSON.stringify(response))
		: image.error
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
