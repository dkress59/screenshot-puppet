import { Request, Response } from 'express'
import { getRouteScreenshot, postRouteScreenshot } from './screenshot/routes'
import { PuppetOptions } from './PuppetOptions'
import { Screenshot as IScreenshot } from './util/Screenshot'

/**
 * * output – source of truth
 * - default
 * - options
 * - ?fileext
 * - ?request
*/

const ScreenshotPuppet = (options?: PuppetOptions | 'get' | 'post'): (req: Request, res: Response) => Promise<void> => {

	if (
		options === 'post'
		|| typeof options === 'object' && 'method' in options && options.method === 'post'
	)
		return async (req: Request, res: Response): Promise<void> =>
			await postRouteScreenshot(req, res, typeof options === 'object'
				? options
				: undefined
			)

	return async (req: Request, res: Response): Promise<void> =>
		await getRouteScreenshot(req, res, typeof options === 'object'
			? options
			: undefined
		)

}

export type Screenshot = IScreenshot

export const getScreenshot = async (req: Request, res: Response): Promise<void> =>
	await getRouteScreenshot(req, res)

export const postScreenshot = async (req: Request, res: Response): Promise<void> =>
	await postRouteScreenshot(req, res)


export default ScreenshotPuppet