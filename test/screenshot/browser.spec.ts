import { Request, Response } from 'express'
import { launchBrowser, makeScreenshot } from '../../src/screenshot/browser'
import { Screenshot } from '../../src/types/Screenshot'

import { launch, Browser } from 'puppeteer'
import { mocked } from 'ts-jest/utils'
jest.mock('puppeteer')

const mockedLaunch = mocked(launch, true)

const env = process.env
const mockPage = {
	emulateMediaFeatures: () => null,
	evaluate: () => null,
	goto: () => null,
	screenshot: () => 'abc',
	setViewport: () => null,
	pdf: () => 'abc',
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

		it('resolves', async() => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			/* jest.spyOn(document, 'querySelectorAll').mockImplementation((selector) => {
				switch (selector) {
					case '.one':
						return null
					case '#two':
						return [
							{ parentNode: { removeChild: () => null } },
							{ parentNode: { removeChild: () => null } },
						]
				}
			}) */

			const mockOptions = {}
			const req: Partial<Request> = {
				path: '/filename.json',
				query: {
					w: '800',
					h: '600',
					url: 'start.duckduckgo.com',
					dark: '1',
					remove: '.one,#two',
					output: 'png',
				},
			}

			const image = await makeScreenshot(mockBrowser as unknown as Browser, new Screenshot(req as Request), mockOptions)

			expect(image).toBeTruthy()
		})

		it('reject newPage', async() => {
			const mockOptions = {}
			const req: Partial<Request> = {
				path: '/filename.json',
				query: {
					w: '800',
					h: '600',
					url: 'start.duckduckgo.com',
					dark: '1',
					remove: '.one,#two',
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

	})

})