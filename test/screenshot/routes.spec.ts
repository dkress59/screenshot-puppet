/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express'
import { getRouteScreenshot } from '../../src/screenshot/routes'
import { PuppetOptions } from '../../src/types/PuppetOptions'

import * as browser from '../../src/screenshot/browser'
import { Browser, ScreenshotOptions } from 'puppeteer'
import { Screenshot } from '../../src/types/Screenshot'

jest.mock('../../src/screenshot/browser', () => ({
	launchBrowser: jest.fn(() =>
		new Promise(resolve =>
			resolve({
				close: () => null,
				newPage: () => ({
					setViewport: () => null,
					goto: () => null,
					screenshot: () => 'abc',
					pdf: () => 'abc',
				}),
			})
		)
	),
	makeScreenshot: (_browser: Browser, image: Screenshot, _options?: ScreenshotOptions) => ({ ...image, src: 'abc' })
}))

let mockRequest: Partial<Request> = {}
let mockResponse: Partial<Response> = {}

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
				type: jest.fn().mockReturnThis(),
				status: jest.fn().mockReturnThis(),
				send: jest.fn().mockReturnThis(),
				end: jest.fn().mockReturnThis(),
			}
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
			expect(browser.launchBrowser).toHaveBeenCalled()
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.send).toMatchSnapshot()
		})

		describe('content type', () => {

			it('set binary correctly', async() => {
				const mockOptions: PuppetOptions = {
					return_url: 'http://return.url',
					output: 'bin'
				}
				const req: Partial<Request> = {
					...mockRequest,
					query: {
						output: 'bin',
						url: 'https://duckduckgo.com',
					}
				}
				const res: Partial<Response> = { ...mockResponse }

				await getRouteScreenshot(req as Request, res as Response, mockOptions)

				expect(res.type).not.toHaveBeenCalled()
			})

			it('set base64 correctly', async() => {
				const mockOptions: PuppetOptions = {
					return_url: 'http://return.url',
					output: 'b64'
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

		})
	
	})

})