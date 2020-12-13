import { Request, Response } from 'express'
import { getScreenshotRoute, postScreenshotRoute } from './screenshot/routes'
import { ShotOptions } from './types'
export * from './types'
export { Screenshot } from './util/Screenshot'

export default function screenshotR(options?: ShotOptions | 'get' | 'post'): (req: Request, res: Response) => Promise<void> {
	const validOptions = typeof options === 'object'
		? options
		: undefined

	if (
		options === 'post'
		|| typeof options === 'object' && 'method' in options && options.method === 'post'
	)
		return async (req: Request, res: Response): Promise<void> =>
			await postScreenshotRoute(req, res, validOptions)

	return async (req: Request, res: Response): Promise<void> =>
		await getScreenshotRoute(req, res, validOptions)
	
}

export const getScreenshot = async (req: Request, res: Response): Promise<void> =>
	await getScreenshotRoute(req, res)

export const postScreenshot = async (req: Request, res: Response): Promise<void> =>
	await postScreenshotRoute(req, res)
