import { PDFOptions, ScreenshotOptions } from 'puppeteer'

export interface PuppetOptions {
	callback?: CallableFunction
	method?: 'get' | 'post'
	output?: 'b64' | 'bin' | 'jpg' | 'json' | 'pdf' | 'png'
	port?: number
	return_url?: string
	screenshot?: ScreenshotOptions | PDFOptions
}