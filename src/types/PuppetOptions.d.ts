import { PDFOptions, ScreenshotOptions } from 'puppeteer'

export interface PuppetOptions {
	return_url?: string
	method?: 'get' | 'post'
	callback?: CallableFunction

	output?: 'b64' | 'bin' | 'jpg' | 'json' | 'pdf' | 'png'
	data?: Record<string, unknown>
	darkMode?: boolean
	override?: boolean

	screenshot?: ScreenshotOptions | PDFOptions
}