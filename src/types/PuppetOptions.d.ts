import { PDFOptions, ScreenshotOptions } from 'puppeteer'

export interface PuppetOptions {
	callback?: CallableFunction
	method?: 'get' | 'post'
	output?: 'b64' | 'bin' | 'jpg' | 'json' | 'pdf' | 'png'
	override?: boolean
	return_url?: string
	data?: Record<string, unknown>
	screenshot?: ScreenshotOptions | PDFOptions
}