import { Request, Response } from 'express'
import { getScreenshotRoute, postScreenshotRoute } from './screenshot/routes'
import { PuppetOptions } from './PuppetOptions'

export default function screenshotR(options?: PuppetOptions | 'get' | 'post'): (req: Request, res: Response) => Promise<void> {
	const validOptions = typeof options === 'object'
		? options
		: undefined

	if (
		options === 'post'
		|| typeof options === 'object' && 'method' in options && options.method === 'post'
	)
		/* istanbul ignore next */ // TODO
		return async (req: Request, res: Response): Promise<void> =>
			await postScreenshotRoute(req, res, validOptions)

	/* istanbul ignore next */ // TODO
	return async (req: Request, res: Response): Promise<void> =>
		await getScreenshotRoute(req, res, validOptions)
	
}

export const getScreenshot = async (req: Request, res: Response): Promise<void> =>
	/* istanbul ignore next */ // TODO
	await getScreenshotRoute(req, res)

export const postScreenshot = async (req: Request, res: Response): Promise<void> =>
	/* istanbul ignore next */ // TODO
	await postScreenshotRoute(req, res)
