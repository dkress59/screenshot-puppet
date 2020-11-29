import { Request, Response } from 'express'
import { fallback } from '../../src/util/middlewares'


const mockResponse: Partial<Response> = {
	status: jest.fn().mockReturnThis(),
	send: jest.fn().mockReturnThis(),
	end: jest.fn().mockReturnThis(),
}


describe('Middlewares', () => {
	
	describe('fallback', () => {

		it('should return 401 if request method !== OPTIONS', async () => {
			const mockRequest: Partial<Request> = { method: 'GET' }
			await fallback(mockRequest as Request, mockResponse as Response)

			expect(mockResponse.status).toHaveBeenCalledWith(401)
			expect(mockResponse.send).toHaveBeenCalledWith({ error: `${mockRequest.method} forbidden for this route.` })
		})

		it('should return 200 if request method === OPTIONS', async () => {
			const mockRequest: Partial<Request> = { method: 'OPTIONS' }
			await fallback(mockRequest as Request, mockResponse as Response)

			expect(mockResponse.status).toHaveBeenCalledWith(200)
			expect(mockResponse.end).toHaveBeenCalledWith()
		})

	})

})
	