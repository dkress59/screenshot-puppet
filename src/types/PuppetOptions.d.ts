import { PDFOptions, ScreenshotOptions } from 'puppeteer'

export interface PuppetOptions {
	callback?: CallableFunction
	method?: 'get' | 'post'
	port?: number
	return_url?: string
	screenshot?: ScreenshotOptions | PDFOptions
}