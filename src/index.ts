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
	const validOptions = typeof options === 'object'
		? options
		: undefined

	if (
		options === 'post'
		|| typeof options === 'object' && 'method' in options && options.method === 'post'
	)
		/* istanbul ignore next */	
		return async (req: Request, res: Response): Promise<void> =>
			await postRouteScreenshot(req, res, validOptions)

	/* istanbul ignore next */
	return async (req: Request, res: Response): Promise<void> =>
		await getRouteScreenshot(req, res, validOptions)
	
}

export type Screenshot = IScreenshot

export const getScreenshot = async (req: Request, res: Response): Promise<void> =>
	/* istanbul ignore next */
	await getRouteScreenshot(req, res)

export const postScreenshot = async (req: Request, res: Response): Promise<void> =>
	/* istanbul ignore next */
	await postRouteScreenshot(req, res)


export default ScreenshotPuppet