import { Screenshot } from '../../src/util/Screenshot'
import { ShotOptions } from '../../src/Options'
import { Request } from 'express'

describe('Screenshot class', () => {

	describe('correctly sets all properties', () => {

		it('defaults', () => {
			const mockRequest = {
				path: '/',
				query: {
					url: 'https://duckduckgo.com'
				}
			}
			const image = new Screenshot(mockRequest as unknown as Request)

			expect(image.w).toBe(1024)
			expect(image.h).toBe(768)
			expect(image.url).toBe(mockRequest.query.url)
			expect(image.src).toBeFalsy()
			expect(image.data).toBeFalsy()
			expect(image.fileName).toBeFalsy()
			expect(image.darkMode).toBe(false)
			expect(image.remove).toBeFalsy()
			expect(image.errors).toEqual([])
			expect(image.output).toBe('json')
		})

		it('setters', () => {
			const mockRequest = {
				path: '/',
				params: {
					filename: 'filename.test.jpg'
				},
				query: {
					url: 'https://duckduckgo.com',
					remove: '#rmvOne,.rmvTwo'
				}
			}
			const image = new Screenshot(mockRequest as unknown as Request)

			expect(image.fileName).toBe('filename.test')
			expect(image.remove).toEqual(['#rmvOne', '.rmvTwo'])
		})

		it('options override forbidden', () => {
			const mockRequest = {
				path: '/',
				query: {
					url: 'https://duckduckgo.com',
					output: 'png',
					dark: 'false',
					data: JSON.stringify({ author :'frontend' }),
				}
			}
			const mockOptions: ShotOptions = {
				override: false,
				output: 'json',
				darkMode: true,
				data: { author: 'backend' }
			}
			const image = new Screenshot(mockRequest as unknown as Request, mockOptions)

			expect(image.data).toEqual(mockOptions.data)
			expect(image.darkMode).toBe(true)
			expect(image.output).toBe('json')
		})

		it('user (query) overrides', () => {
			const mockRequest = {
				path: '/',
				query: {
					url: 'https://duckduckgo.com',
					dark: 'false',
					data: JSON.stringify({ editor: 'frontend' }),
					output: 'png',
				}
			}
			const mockOptions: ShotOptions = {
				override: true,
				data: { author: 'backend' },
				output: 'json',
				darkMode: true,
			}
			const image = new Screenshot(mockRequest as unknown as Request, mockOptions)

			expect(image.data).toEqual({ author: 'backend', editor: 'frontend' })
			expect(image.darkMode).toBe(false)
			expect(image.output).toBe('png')
		})

	})

})