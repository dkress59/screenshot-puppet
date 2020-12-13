/**
 * @jest-environment jsdom
 */
import { Request, Response } from 'express'
import { launchBrowser, makeScreenshot } from '../../src/screenshot/browser'
import { Screenshot } from '../../src/util/Screenshot'

import { launch, Browser, ScreenshotOptions } from 'puppeteer'
import { mocked } from 'ts-jest/dist/utils/testing'
import { ShotOptions } from '../../src/types'
jest.mock('puppeteer')

const mockedLaunch = mocked(launch, true)

const env = process.env
const mockPage = {
	emulateMediaFeatures: () => null,
	evaluate: () => null,
	goto: () => null,
	screenshot: jest.fn(),
	setViewport: () => null,
	pdf: jest.fn(),
}
const mockBrowser = {
	close: () => null,
	newPage: () => (mockPage),
}

let mockRequest: Partial<Request> = {}
let mockResponse: Partial<Response> = {}


describe('Puppeteer Screenshot Mechanism', () => {
	beforeEach(() => {
		process.env.NODE_ENV = 'test'
		mockedLaunch.mockImplementation((): Promise<Browser> =>
			new Promise(resolve => resolve(mockBrowser as unknown as Browser))
		)
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
	afterAll(() => { process.env = env })

	describe('launching browser', () => {
		it('returns browser', async() => {
			const browser = await launchBrowser()

			expect(mockResponse.status).not.toHaveBeenCalled()
			expect(mockResponse.send).not.toHaveBeenCalled()

			expect(browser).toEqual(mockBrowser)
		})

		/* it('fails and sends error', async() => {
			mockedLaunch.mockRejectedValue({ mock_error: 'mock error' })
			const browser = await launchBrowser()

			expect(mockResponse.status).toHaveBeenCalledWith(500)
			expect(mockResponse.send).toHaveBeenCalledWith({
				message: 'error launching puppeteer',
				error: 'mock error',
			})

			expect(await launchBrowser).toThrow()
		}) */
	})

	describe('retreiving screen shot', () => {

		beforeEach(() => {
			mockPage.screenshot.mockReset().mockImplementation(() => 'abc')
			mockPage.pdf.mockReset().mockImplementation(() => 'abc')
		})

		it('resolves', async() => {

			const mockOptions = {}
			const req: Partial<Request> = {
				path: '/filename.json',
				query: {
					w: '800',
					h: '600',
					url: 'start.duckduckgo.com',
					dark: 'true',
					remove: JSON.stringify(['.one','#two']),
					output: 'png',
				},
			}

			const image = await makeScreenshot(mockBrowser as unknown as Browser, new Screenshot(req as Request), mockOptions)

			expect(image).toBeTruthy()
		})

		it('resolves binary', async() => {

			const mockOptions = {}
			const req: Partial<Request> = {
				path: '/filename',
				query: {
					output: 'bin',
				},
			}

			await makeScreenshot(mockBrowser as unknown as Browser, new Screenshot(req as Request), mockOptions)

			expect(mockPage.screenshot).toHaveBeenCalledWith({'encoding': 'binary','path': undefined,'quality': undefined,'type': 'png',
			})
		})

		it('reject newPage', async() => {
			const mockOptions = {}
			const req: Partial<Request> = {
				path: '/filename.json',
				query: {
					w: '800',
					h: '600',
					url: 'start.duckduckgo.com',
					dark: 'true',
					remove: JSON.stringify(['.one','#two']),
					output: 'png',
				},
			}

			const image = await makeScreenshot({
				...mockBrowser,
				newPage: () => ({
					...mockPage,
					evaluate: () => Promise.reject('rejection')
				})
			} as unknown as Browser, new Screenshot(req as Request), mockOptions)

			// + document.querySelector
			expect(image.errors).toEqual(['rejection', 'rejection'])
			expect(image).toMatchSnapshot()
		})

		it('reject evauluate', async() => {
			const mockOptions = {}

			const image = await makeScreenshot({
				...mockBrowser,
				newPage: () => Promise.reject('rejection')
			} as unknown as Browser, new Screenshot(mockRequest as Request), mockOptions)

			expect(image.errors).toEqual(['rejection'])
		})

		it('configures jpeg screen shot correctly', async() => {
			const mockOptions: ScreenshotOptions = {
				type: 'jpeg'
			}

			await makeScreenshot(mockBrowser as unknown as Browser, new Screenshot(mockRequest as Request), mockOptions)

			expect(mockPage.screenshot).toHaveBeenCalledWith({'encoding': 'base64', 'path': undefined, 'quality': undefined, 'type': 'jpeg'})
		})

		it('configures pdf screen shot correctly', async() => {
			const mockOptions: ShotOptions = {
				output: 'pdf'
			}

			await makeScreenshot(mockBrowser as unknown as Browser, new Screenshot(mockRequest as Request, mockOptions))

			expect(mockPage.pdf).toHaveBeenCalledWith({'encoding': 'base64', 'path': undefined, 'quality': undefined, 'type': undefined})
		})

		it('configures jpg (2) screen shot correctly', async() => {
			const mockOptions: ShotOptions = {
				output: 'jpg'
			}

			await makeScreenshot(mockBrowser as unknown as Browser, new Screenshot(mockRequest as Request, mockOptions))

			expect(mockPage.screenshot).toHaveBeenCalledWith({'encoding': 'base64', 'path': undefined, 'quality': undefined, 'type': 'jpeg'})
		})

		it('configures png screen shot correctly', async() => {
			const mockOptions: ShotOptions = {
				output: 'png'
			}

			await makeScreenshot(mockBrowser as unknown as Browser, new Screenshot(mockRequest as Request, mockOptions))

			expect(mockPage.screenshot).toHaveBeenCalledWith({'encoding': 'base64', 'path': undefined, 'quality': undefined, 'type': 'png'})
		})

	})

	it('configures screen shot quality correctly', async() => {
		const mockOptions: ScreenshotOptions = {
			quality: 59
		}

		await makeScreenshot(mockBrowser as unknown as Browser, new Screenshot(mockRequest as Request), mockOptions)

		expect(mockPage.screenshot).toHaveBeenCalledWith({'encoding': 'base64', 'path': undefined, 'quality': 59, 'type': 'png'})
	})

})