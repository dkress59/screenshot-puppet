import { LaunchOptions, PDFOptions, ScreenshotOptions } from 'puppeteer'
import { NextFunction, Request, Response } from 'express'

export interface PuppetOptions {
	return_url?: string
	method?: 'get' | 'post'
	callback?: CallableFunction
	middleware?: (req: Request, res: Response, next: NextFunction) => void // ??

	output?: 'bin' | 'jpg' | 'json' | 'pdf' | 'png'
	data?: Record<string, unknown>
	darkMode?: boolean
	override?: boolean

	screenshot?: ScreenshotOptions | PDFOptions
	browser?: LaunchOptions
}

/**
 * | JSON
 * - JPG
 * - PDF
 * - PNG
 * | B64
 * - JPG
 * - PDF
 * - PNG
 * | BIN
 */