import { LaunchOptions, PDFOptions, ScreenshotOptions } from 'puppeteer'

export interface PuppetOptions {
	return_url?: string
	method?: 'get' | 'post'
	callback?: CallableFunction

	output?: 'bin' | 'jpg' | 'json' | 'pdf' | 'png'
	data?: Record<string, unknown>
	darkMode?: boolean
	override?: boolean

	screenshot?: ScreenshotOptions | PDFOptions
	browser?: LaunchOptions
}

/**
 * | BIN
 * | B64
 * - JPG
 * - PDF
 * - PNG
 * | JSON
 * - JPG
 * - PDF
 * - PNG
 */