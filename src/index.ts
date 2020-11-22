import { Request, Response } from 'express'
import { getRouteScreenshot, postRouteScreenshot } from './routes'

export const getSC = async (req: Request, res: Response): Promise<void> =>
	await getRouteScreenshot(req, res)

export const postSC = async (req: Request, res: Response): Promise<void> =>
	await postRouteScreenshot(req, res)

export default { getSC, postSC }