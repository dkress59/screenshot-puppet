/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express'
import { getRouteScreenshot, postRouteScreenshot } from '../../src/screenshot/routes'
import { PuppetOptions } from '../../src/PuppetOptions'

import { Browser, Page, ScreenshotOptions } from 'puppeteer'
import { Screenshot } from '../../src/util/Screenshot'

import { makeScreenshot, launchBrowser } from '../../src/screenshot/browser'
import { mocked } from 'ts-jest/utils'
jest.mock('../../src/screenshot/browser')

const mockedMakeScreenshot = mocked(makeScreenshot, true)
const mockedLaunchBrowser = mocked(launchBrowser, true)

let mockRequest: Partial<Request> = {}
const mockResType = jest.fn()
const mockResStatus = jest.fn()
const mockResSend = jest.fn()
const mockResEnd = jest.fn()
let mockResponse = {}

const env = process.env

describe('Screenshot Routes', () => {

	describe('GET route', () => {
		beforeEach(() => {
			mockRequest = {
				path: '/',
				query: {
					url: 'https://duckduckgo.com'
				}
			}
			mockResponse = {
				type: mockResType.mockReset().mockReturnThis(),
				status: mockResStatus.mockReset().mockReturnThis(),
				send: mockResSend.mockReset().mockReturnThis(),
				end: mockResEnd.mockReset().mockReturnThis(),
			}
			mockedLaunchBrowser.mockImplementation((): Promise<Browser> =>
				new Promise(resolve =>
					resolve({
						close: () => null,
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
			const mockOptions: PuppetOptions = {
				return_url: 'http://return.url',
			}
			/* const mockQuery = {}
			const req: Partial<Request> = {
				...mockRequest,
				query: {
					url: mockRequest.query!.url,
					...mockQuery
				}
			} */
			const req: Partial<Request> = { ...mockRequest }
			const res: Partial<Response> = { ...mockResponse }

			await getRouteScreenshot(req as Request, res as Response, mockOptions)

			expect(res.type).toHaveBeenCalledWith('json')
			expect(mockedLaunchBrowser).toHaveBeenCalled()
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.send).toMatchSnapshot()
		})

		it('calls callback', async() => {
			const callback = jest.fn()
			const mockOptions: PuppetOptions = {
				return_url: 'http://return.url',
				callback,
			}
			const req: Partial<Request> = { ...mockRequest }
			const res: Partial<Response> = { ...mockResponse }

			await getRouteScreenshot(req as Request, res as Response, mockOptions)

			expect(callback).toHaveBeenCalled()
		})

		describe('content type', () => {

			it('set json correctly', async() => {
				const mockOptions: PuppetOptions = {
					return_url: 'http://return.url',
					// @ts-ignore
					output: 'invalid'
				}
				const req: Partial<Request> = { ...mockRequest }
				const res: Partial<Response> = { ...mockResponse }

				await getRouteScreenshot(req as Request, res as Response, mockOptions)

				expect(res.type).toHaveBeenCalledWith('json')
			})

			it('set jpeg correctly', async() => {
				const mockOptions: PuppetOptions = {
					return_url: 'http://return.url',
					output: 'jpg'
				}
				const req: Partial<Request> = { ...mockRequest }
				const res: Partial<Response> = { ...mockResponse }

				await getRouteScreenshot(req as Request, res as Response, mockOptions)

				expect(res.type).toHaveBeenCalledWith('jpg')
			})

			it('set pdf correctly', async() => {
				const mockOptions: PuppetOptions = {
					return_url: 'http://return.url',
					output: 'pdf'
				}
				const req: Partial<Request> = { ...mockRequest }
				const res: Partial<Response> = { ...mockResponse }

				await getRouteScreenshot(req as Request, res as Response, mockOptions)

				expect(res.type).toHaveBeenCalledWith('pdf')
			})

			it('set png correctly', async() => {
				const mockOptions: PuppetOptions = {
					return_url: 'http://return.url',
					output: 'png',
					override: true,
				}
				const req: Partial<Request> = { ...mockRequest }
				const res: Partial<Response> = { ...mockResponse }

				await getRouteScreenshot(req as Request, res as Response, mockOptions)

				expect(res.type).toHaveBeenCalledWith('png')
			})

			it('set bin correctly', async() => {
				const mockOptions: PuppetOptions = {
					return_url: 'http://return.url',
					output: 'bin'
				}
				const req: Partial<Request> = { ...mockRequest }
				const res: Partial<Response> = { ...mockResponse }

				await getRouteScreenshot(req as Request, res as Response, mockOptions)

				expect(res.type).not.toHaveBeenCalled()
			})

		})
	
	})

	describe('POST Route', () => {
		beforeEach(() => {
			process.env.NODE_ENV = 'test'
			mockRequest = {
				path: '/',
				body: [{
					url: 'https://duckduckgo.com'
				}, {
					url: 'https://github.com'
				}],
			}
			mockResponse = {
				type: mockResType.mockReset().mockReturnThis(),
				status: mockResStatus.mockReset().mockReturnThis(),
				send: mockResSend.mockReset().mockReturnThis(),
				end: mockResEnd.mockReset().mockReturnThis(),
			}
		})
		afterAll(() => {
			process.env = env
		})

		it('returns screenshot', async() => {
			const mockOptions: PuppetOptions = {
				return_url: 'http://return.url',
			}
			const req: Partial<Request> = { ...mockRequest }
			const res: Partial<Response> = { ...mockResponse }

			await postRouteScreenshot(req as Request, res as Response, mockOptions)

			expect(res.type).toHaveBeenCalledWith('json')
			expect(mockedLaunchBrowser).toHaveBeenCalled()
			// expect(res.status).toHaveBeenCalledWith(200) // FIXME
			expect(res.send).toMatchSnapshot()
		})

		it('returns errors', async() => {
			const mockOptions: PuppetOptions = {
				return_url: 'http://return.url',
			}
			const req: Partial<Request> = { ...mockRequest }
			const res: Partial<Response> = {
				...mockResponse,
			}

			mockedMakeScreenshot.mockRejectedValue('rejection')

			await postRouteScreenshot(req as Request, res as Response, mockOptions)

			expect(res.type).toHaveBeenCalledWith('json')
			//expect(res.status).toHaveBeenCalledWith(200) // FIXME
			//expect(res.send).toBeCalledWith({})
			expect(res.send).toMatchSnapshot()
		})

		it('calls callback', async() => {
			const callback = jest.fn()
			const mockOptions: PuppetOptions = {
				return_url: 'http://return.url',
				callback,
			}
			const req: Partial<Request> = { ...mockRequest }
			const res: Partial<Response> = { ...mockResponse }

			await postRouteScreenshot(req as Request, res as Response, mockOptions)

			expect(callback).toHaveBeenCalled()
		})
		
	})
	

})