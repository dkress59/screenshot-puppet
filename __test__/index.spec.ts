import { Request, Response } from 'express'
import screenshotR from '../src'
import { getScreenshotRoute } from '../src/screenshot/routes'
const mockScreenshotR = async (_req: Request, _res: Response) => await Promise.resolve()

describe('screenshotR', () => {
	it('works', () => {
		// expect(screenshotR()).toEqual(async (_req: Request, _res: Response) => await Promise.resolve())
		expect(screenshotR()).toBeTruthy()
		expect(screenshotR('get')).toBeTruthy()
		expect(screenshotR({ method: 'post' })).toBeTruthy()
		// expect(screenshotR(undefined)).toBeTruthy()
		// expect(screenshotR({method: 'get'})).toBeTruthy()
		// expect(screenshotR({method: 'post'})).toBeTruthy()
	})
	// + mockGetRouteScreenshot
	// + mockPostRouteScreenshot
})
