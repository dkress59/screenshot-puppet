/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express'
import { getRouteScreenshot } from '../../src/screenshot/routes'
import { PuppetOptions } from '../../src/types/PuppetOptions'
// + mock launchBrowser()

import * as browser from '../../src/screenshot/browser'

const mockRequest = {
	path: '/',
	query: {
		url: 'https://duckduckgo.com'
	}
}
const mockResponse = ({ type, status, send, end }: {
	type?: jest.Mock<any, any>
	status?: jest.Mock<any, any>
	send?: jest.Mock<any, any>
	end?: jest.Mock<any, any>
}) => {
	const res = {}
	// @ts-ignore
	res.type = type ?? jest.fn().mockReturnValue(res)
	// @ts-ignore
	res.status = status ?? jest.fn().mockReturnValue(res)
	// @ts-ignore
	res.send = send ?? jest.fn().mockReturnValue(res)
	// @ts-ignore
	res.end = end ?? jest.fn().mockReturnValue(res)
	return res
}

describe('Screenshot Routes', () => {

	describe('GET route', () => {
		beforeEach(() => {
			// @ts-ignore // prevent memory leak
			browser.launchBrowser = jest.fn(() =>
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
			)
		})

		it('returns screenshot', async() => {
			const res = mockResponse({})
			const mockOptions: PuppetOptions = {
				return_url: 'http://return.url',
			}
			const mockQuery = {}
			const req = { ...mockRequest, query: {
				url: mockRequest.query.url, mockQuery
			} }

			await getRouteScreenshot(req as unknown as Request, res as unknown as Response, mockOptions)

			// @ts-ignore
			expect(res.type).toHaveBeenCalledWith('json')
			expect(browser.launchBrowser).toHaveBeenCalled()
			// @ts-ignore
			expect(res.status).toHaveBeenCalledWith(200)
			// @ts-ignore
			expect(res.send).toMatchSnapshot()
		})

		describe('content type', () => {

			it('set binary correctly', async() => {
				const res = mockResponse({})
				const mockOptions: PuppetOptions = {
					return_url: 'http://return.url',
					output: 'bin'
				}
				const mockQuery = {
					output: 'bin'
				}
				const req = { ...mockRequest, query: {
					url: mockRequest.query.url, mockQuery
				} }

				await getRouteScreenshot(req as unknown as Request, res as unknown as Response, mockOptions)

				// @ts-ignore
				expect(res.type).not.toHaveBeenCalled()
			})

			it('set base64 correctly', async() => {
				const res = mockResponse({})
				const mockOptions: PuppetOptions = {
					return_url: 'http://return.url',
					output: 'b64'
				}
				const mockQuery = {}
				const req = { ...mockRequest, query: {
					url: mockRequest.query.url, mockQuery
				} }

				await getRouteScreenshot(req as unknown as Request, res as unknown as Response, mockOptions)

				// @ts-ignore
				expect(res.type).toHaveBeenCalledWith('json')
			})

			it('set jpeg correctly', async() => {
				const res = mockResponse({})
				const mockOptions: PuppetOptions = {
					return_url: 'http://return.url',
					output: 'jpg'
				}
				const mockQuery = {}
				const req = { ...mockRequest, query: {
					url: mockRequest.query.url, mockQuery
				} }

				await getRouteScreenshot(req as unknown as Request, res as unknown as Response, mockOptions)

				// @ts-ignore
				expect(res.type).toHaveBeenCalledWith('jpg')
			})

			it('set pdf correctly', async() => {
				const res = mockResponse({})
				const mockOptions: PuppetOptions = {
					return_url: 'http://return.url',
					output: 'pdf'
				}
				const mockQuery = {}
				const req = { ...mockRequest, query: {
					url: mockRequest.query.url, mockQuery
				} }

				await getRouteScreenshot(req as unknown as Request, res as unknown as Response, mockOptions)

				// @ts-ignore
				expect(res.type).toHaveBeenCalledWith('pdf')
			})

			it('set png correctly', async() => {
				const res = mockResponse({})
				const mockOptions: PuppetOptions = {
					return_url: 'http://return.url',
					output: 'png',
					override: true,
				}
				const mockQuery = {}
				const req = { ...mockRequest, query: {
					url: mockRequest.query.url, mockQuery
				} }

				await getRouteScreenshot(req as unknown as Request, res as unknown as Response, mockOptions)

				// @ts-ignore
				expect(res.type).toHaveBeenCalledWith('png')
			})

		})
	
	})

})