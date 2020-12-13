import { Request, Response } from 'express'
import screenshotR, { getScreenshot, postScreenshot } from '../src'

jest.mock('../src/screenshot/routes', () => ({
	getScreenshotRoute: jest.fn(() => new Promise(resolve => resolve('GET'))),
	postScreenshotRoute: jest.fn(() => new Promise(resolve => resolve('POST'))),
}))

describe('screenshotR', () => {
	it('works', async() => {
		expect(await screenshotR()({} as Request, {} as Response)).toEqual('GET')
		expect(await screenshotR('post')({} as Request, {} as Response)).toEqual('POST')
		expect(await screenshotR({ method: 'post' })({} as Request, {} as Response)).toEqual('POST')

		expect(await getScreenshot({} as Request, {} as Response)).toEqual('GET')
		expect(await postScreenshot({} as Request, {} as Response)).toEqual('POST')
	})
})
