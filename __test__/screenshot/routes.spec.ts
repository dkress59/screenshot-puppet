/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express'
import { getScreenshotRoute, postScreenshotRoute } from '../../src/screenshot/routes'
import { ShotOptions } from '../../src/types'

import { Browser, Page, ScreenshotOptions } from 'puppeteer'
import { Screenshot } from '../../src/util/Screenshot'

import { makeScreenshot, launchBrowser } from '../../src/screenshot/browser'
import { mocked } from 'ts-jest/utils'
jest.mock('../../src/screenshot/browser')

const mockedMakeScreenshot = mocked(makeScreenshot, true)
const mockedLaunchBrowser = mocked(launchBrowser, true)

let req: Partial<Request> = {}
const mockResType = jest.fn()
const mockResStatus = jest.fn()
const mockResSend = jest.fn()
const mockResEnd = jest.fn()
let res: Partial<Response> = {
	type: mockResType,
	status: mockResStatus,
	send: mockResSend,
	end: mockResEnd,
}

const env = process.env

describe('Screenshot Routes', () => {

	describe('GET route', () => {
		beforeEach(() => {
			req = {
				path: '/getRoute/',
				query: {
					url: 'https://duckduckgo.com'
				}
			}
			res = {
				type: mockResType.mockReset().mockReturnThis(),
				status: mockResStatus.mockReset().mockReturnThis(),
				send: mockResSend.mockReset().mockReturnThis(),
				end: mockResEnd.mockReset().mockReturnThis(),
			}
			mockedLaunchBrowser.mockImplementation((): Promise<Browser> =>
				new Promise(resolve =>
					resolve({
						close: () => ({
							catch: () => null
						}),
						newPage: () => ({
							setViewport: () => null,
							goto: () => null,
							screenshot: () => 'abc',
							pdf: () => 'abc',
						} as unknown as Page),
					} as unknown as Browser)
				)
			)
			mockedMakeScreenshot.mockImplementation(
				(_browser: Browser, image: Screenshot, _options?: ScreenshotOptions): Promise<Screenshot> =>
					new Promise(resolve => resolve({ ...image, src: 'abc' } as unknown as Screenshot))
			)
		})

		it('returns screenshot', async() => {
			const mockOptions: ShotOptions = {
				return_url: 'http://return.url',
			}
			/* const mockQuery = {}
			const req: Partial<Request> = {
				...req,
				query: {
					url: req.query!.url,
					...mockQuery
				}
			} */

			await getScreenshotRoute(req as Request, res as Response, mockOptions)

			expect(res.type).toHaveBeenCalledWith('json')
			expect(mockedLaunchBrowser).toHaveBeenCalled()
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.send).toMatchSnapshot()
		})

		it('calls callback', async() => {
			const callback = jest.fn()
			const mockOptions: ShotOptions = {
				return_url: 'http://return.url',
				callback,
			}

			await getScreenshotRoute(req as Request, res as Response, mockOptions)

			expect(callback).toHaveBeenCalled()
		})

		describe('content type', () => {

			it('set json correctly', async() => {
				const mockOptions: ShotOptions = {
					return_url: 'http://return.url',
					// @ts-ignore
					output: 'invalid'
				}

				await getScreenshotRoute(req as Request, res as Response, mockOptions)

				expect(res.type).toHaveBeenCalledWith('json')
			})

			it('set jpeg correctly', async() => {
				const mockOptions: ShotOptions = {
					return_url: 'http://return.url',
					output: 'jpg'
				}

				await getScreenshotRoute(req as Request, res as Response, mockOptions)

				expect(res.type).toHaveBeenCalledWith('jpg')
			})

			it('set pdf correctly', async() => {
				const mockOptions: ShotOptions = {
					return_url: 'http://return.url',
					output: 'pdf'
				}

				await getScreenshotRoute(req as Request, res as Response, mockOptions)

				expect(res.type).toHaveBeenCalledWith('pdf')
			})

			it('set png correctly', async() => {
				const mockOptions: ShotOptions = {
					return_url: 'http://return.url',
					output: 'png',
					override: true,
				}

				await getScreenshotRoute(req as Request, res as Response, mockOptions)

				expect(res.type).toHaveBeenCalledWith('png')
			})

			it('set bin correctly', async() => {
				const mockOptions: ShotOptions = {
					return_url: 'http://return.url',
					output: 'bin'
				}

				await getScreenshotRoute(req as Request, res as Response, mockOptions)

				expect(res.type).not.toHaveBeenCalled()
			})

		})
	
	})

	describe('POST Route', () => {
		beforeEach(() => {
			process.env.NODE_ENV = 'test'
			req = {
				path: '/postRoute/',
				body: [{
					url: 'https://duckduckgo.com'
				}, {
					url: 'https://github.com'
				}],
			}
			res = {
				type: mockResType.mockReset().mockReturnThis(),
				status: mockResStatus.mockReset().mockReturnThis(),
				send: mockResSend.mockReset().mockReturnThis(),
				end: mockResEnd.mockReset().mockReturnThis(),
			}
			mockedLaunchBrowser.mockImplementation((): Promise<Browser> =>
				new Promise((resolve) =>
					resolve({
						close: () => ({
							catch: () => null
						}),
						newPage: () => ({
							setViewport: () => null,
							goto: () => null,
							screenshot: () => 'abc',
							pdf: () => 'abc',
						} as unknown as Page),
					} as unknown as Browser)
				)
			)
		})
		afterAll(() => {
			process.env = env
		})

		it('returns screenshot', async() => {
			const mockOptions: ShotOptions = {
				return_url: 'http://return.url',
			}

			await postScreenshotRoute(req as Request, res as Response, mockOptions)

			expect(res.type).toHaveBeenCalledWith('json')
			expect(mockedLaunchBrowser).toHaveBeenCalled()
			// expect(res.status).toHaveBeenCalledWith(200)
			expect(res.send).toMatchSnapshot()
		})

		it('returns errors', async() => {
			const mockOptions: ShotOptions = {
				return_url: 'http://return.url',
			}

			mockedMakeScreenshot.mockImplementation(() => Promise.reject('rejection'))

			await postScreenshotRoute(req as Request, res as Response, mockOptions)

			expect(res.type).toHaveBeenCalledWith('json')
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.send).toBeCalledWith('{"errors":[{"w":1024,"h":768,"url":"https://duckduckgo.com","src":"","darkMode":false,"errors":["rejection"],"output":"json"},{"w":1024,"h":768,"url":"https://github.com","src":"","darkMode":false,"errors":["rejection"],"output":"json"}],"originalUrl":"http://return.url/postRoute/","response":[]}')
			expect(res.send).toMatchSnapshot()
		})

		it('calls callback', async() => {
			const callback = jest.fn()
			const mockOptions: ShotOptions = {
				return_url: 'http://return.url',
				callback,
			}

			await postScreenshotRoute(req as Request, res as Response, mockOptions)

			expect(callback).toHaveBeenCalled()
		})
		
	})
	

})