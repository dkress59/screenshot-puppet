import { NextFunction, Request, Response } from 'express'
import { cache, fallback } from '../../src/util/middlewares'


const mockStatus = jest.fn().mockReturnThis()
const mockSend = jest.fn().mockReturnThis()
const mockEnd = jest.fn().mockReturnThis()
const mockResponse: Partial<Response> = {
	status: mockStatus,
	send: mockSend,
	end: mockEnd,
}
const mockNext = jest.fn(() => null)


describe('Middlewares', () => {
	
	describe('fallback', () => {

		it('should return 401 if request method !== OPTIONS', () => {
			const mockRequest: Partial<Request> = { method: 'GET' }
			fallback(mockRequest as Request, mockResponse as Response)

			expect(mockResponse.status).toHaveBeenCalledWith(401)
			expect(mockResponse.send).toHaveBeenCalledWith({ error: `${mockRequest.method ?? 'Method'} forbidden for this route.` })
		})

		it('should return 200 if request method === OPTIONS', () => {
			const mockRequest: Partial<Request> = { method: 'OPTIONS' }
			fallback(mockRequest as Request, mockResponse as Response)

			expect(mockResponse.status).toHaveBeenCalledWith(200)
			expect(mockResponse.end).toHaveBeenCalledWith()
		})

	})
	
	describe('cache', () => {
		beforeEach(() => {
			mockStatus.mockReset().mockReturnThis()
			mockSend.mockReset().mockReturnThis()
			mockEnd.mockReset().mockReturnThis()
			mockNext.mockReset()
		})

		it('OPTIONS immediately calls next()', async () => {
			const mockRequest: Partial<Request> = { method: 'OPTIONS', path: '/' }
			await cache(mockRequest as Request, mockResponse as Response, mockNext as NextFunction)

			expect(mockResponse.status).not.toHaveBeenCalled()
			expect(mockResponse.send).not.toHaveBeenCalled()
			expect(mockNext).toHaveBeenCalled()
		})

		it('GET missing URL returns 400', async () => {
			const mockRequest: Partial<Request> = { method: 'GET', path: '/' }
			await cache(mockRequest as Request, mockResponse as Response, mockNext as NextFunction)

			expect(mockResponse.status).toHaveBeenCalledWith(400)
			expect(mockResponse.send).toHaveBeenCalledWith({ error: 'Required param(s) missing.' })
			expect(mockNext).not.toHaveBeenCalled()
		})

		it('fake GET cache retreival works', async () => {
			const mockRequest: Partial<Request> = {
				method: 'GET', path: '/', query: {
					url: 'https://duckduckgo.com'
				}
			}
			await cache(mockRequest as Request, mockResponse as Response, mockNext as NextFunction)

			expect(mockResponse.status).not.toHaveBeenCalled()
			expect(mockResponse.send).not.toHaveBeenCalled()
			expect(mockNext).toHaveBeenCalled()
		})

		it('POST missing body returns 402', async () => {
			const mockRequest: Partial<Request> = { method: 'POST', path: '/' }
			await cache(mockRequest as Request, mockResponse as Response, mockNext as NextFunction)

			expect(mockResponse.status).toHaveBeenCalledWith(402)
			expect(mockResponse.send).toHaveBeenCalledWith({ error: 'Nothing passed in the request body.' })
			expect(mockNext).not.toHaveBeenCalled()
		})

		it('fake POST cache retreival works', async () => {
			const mockRequest: Partial<Request> = {
				method: 'POST', path: '/', body: [{
					url: 'https://duckduckgo.com'
				}, {
					url: 'https://duckduckgo.com'
				}]
			}
			await cache(mockRequest as Request, mockResponse as Response, mockNext as NextFunction)

			expect(mockRequest.body).toEqual({'cached': [], 'needed': [{'url': 'https://duckduckgo.com'}, {'url': 'https://duckduckgo.com'}]})
			expect(mockResponse.status).not.toHaveBeenCalled()
			expect(mockResponse.send).not.toHaveBeenCalled()
			expect(mockNext).toHaveBeenCalled()
		})

	})

})
	