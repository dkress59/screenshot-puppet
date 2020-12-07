import { Request, Response } from 'express'
import Puppet from '../src'
import { getScreenshotRoute } from '../src/screenshot/routes'
const mockPuppet = async (_req: Request, _res: Response) => await Promise.resolve()

describe('Puppet', () => {
	it('works', () => {
		// expect(Puppet()).toEqual(async (_req: Request, _res: Response) => await Promise.resolve())
		expect(Puppet()).toBeTruthy()
		expect(Puppet('get')).toBeTruthy()
		expect(Puppet({ method: 'post' })).toBeTruthy()
		// expect(Puppet(undefined)).toBeTruthy()
		// expect(Puppet({method: 'get'})).toBeTruthy()
		// expect(Puppet({method: 'post'})).toBeTruthy()
	})
	// + mockGetRouteScreenshot
	// + mockPostRouteScreenshot
})
