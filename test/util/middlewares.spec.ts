/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fallback } from '../../src/util/middlewares'

const mockRequest = (requestMethod: 'GET' | 'POST' | 'OPTIONS') => {
	return {
		method: requestMethod,
	}
}


const mockResponse = () => {
	const res = {}
	// @ts-ignore
	res.status = jest.fn().mockReturnValue(res)
	// @ts-ignore
	res.send = jest.fn().mockReturnValue(res)
	// @ts-ignore
	res.end = jest.fn().mockReturnValue(res)
	return res
}


describe('Middlewares', () => {
	
	
	describe('fallback', () => {
		test('should return 401 if request method !== OPTIONS', async () => {
			const req = mockRequest('GET')
			const res = mockResponse()
			// @ts-ignore
			await fallback(req, res)
			// @ts-ignore
			expect(res.status).toHaveBeenCalledWith(401)
			// @ts-ignore
			expect(res.send).toHaveBeenCalledWith({ error: `${req.method} forbidden for this route.` })
		})
		test('should return 200 if request method === OPTIONS', async () => {
			const req = mockRequest('OPTIONS')
			const res = mockResponse()
			// @ts-ignore
			await fallback(req, res)
			// @ts-ignore
			expect(res.status).toHaveBeenCalledWith(200)
			// @ts-ignore
			expect(res.end).toHaveBeenCalledWith()
		})
	})

})
	