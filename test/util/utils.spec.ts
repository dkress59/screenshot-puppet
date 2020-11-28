import { logErrorToConsole, logToConsole, logWarningToConsole } from '../../src/util/utils'

const originalLog = console.log
const originalWarn = console.warn
const originalError = console.error
	
describe('Utilitites', () => {
	const OLD_ENV = process.env
		
	afterEach(() => {
		jest.resetModules() // most important - it clears the cache
		process.env = { ...OLD_ENV } // make a copy
		
		console.log = originalLog
		console.warn = originalWarn
		console.error = originalError
	})

	afterAll(() => {
		process.env = OLD_ENV // restore old env
	})
		
	describe('Check console output', () => {
		const consoleOutput: string[] = []
		const mockedLog = (...output: string[]) => consoleOutput.push(...output)
		const mockedWarn = (...output: string[]) => consoleOutput.push(...output)
		const mockedError = (...output: string[]) => consoleOutput.push(...output)

		beforeEach(() => {
			process.env.NODE_ENV = 'development'

			consoleOutput.length = 0
			console.log = mockedLog
			console.warn = mockedWarn
			console.error = mockedError
		})

		it('only records to console if NODE_ENV === \'development\'', () => {
			process.env.NODE_ENV = 'production'
			logToConsole('first log', 'second arg')
			logErrorToConsole('second log', 'second arg')
			logWarningToConsole('third')
			expect(consoleOutput).toEqual([])
		})

		it('shows logs in console', () => {
			logToConsole('first log', 'second arg')
			logToConsole('second log', 'second arg', 'third')
			expect(consoleOutput).toEqual(['first log', 'second arg', 'second log', 'second arg', 'third'])
		})

		it('shows errors in console', () => {
			logErrorToConsole('first log', 'second arg')
			logErrorToConsole('second log', 'second arg', 'third')
			expect(consoleOutput).toEqual(['first log', 'second arg', 'second log', 'second arg', 'third'])
		})

		it('shows warnings in console', () => {
			logWarningToConsole('first log', 'second arg')
			logWarningToConsole('second log', 'second arg', 'third')
			expect(consoleOutput).toEqual(['first log', 'second arg', 'second log', 'second arg', 'third'])
		})
	})
	
})