import { NextFunction, Request, Response } from 'express'
import { LaunchOptions, PDFOptions, ScreenshotOptions } from 'puppeteer'
export { LaunchOptions, PDFOptions, ScreenshotOptions } from 'puppeteer'

export interface ShotOptions {
	return_url?: string
	method?: 'get' | 'post'
	callback?: CallableFunction
	middleware?: (req: Request, res: Response) => Promise<string | false | null>
	
	/**
	 * 'bin':
	 * – Direct Buffer output
	 * 'json':
	 * – JSON containing JPEG/PDF/PNG Base64 String
	 * 'jpg' | 'pdf' | 'png':
	 * – JPEG/PDF/PNG Base64 String
	 */
	output?: 'bin' | 'jpg' | 'json' | 'pdf' | 'png'
	data?: Record<string, unknown>
	darkMode?: boolean
	override?: boolean | ShotOverrides

	screenshot?: ScreenshotOptions | PDFOptions
	browser?: LaunchOptions
}

export interface ShotOverrides {
	output?: boolean
	data?: boolean
	darkMode?: boolean
	//return_url?: boolean
	width?: boolean
	height?: boolean
}

export interface ShotQuery {
	w?: number
	h?: number
	url?: string
	data?: string // JSON.stringify(Record<string, any>)
	dark?: boolean
	remove?: string // JSON.stringify(List)
	output?: 'bin' | 'jpg' | 'json' | 'pdf' | 'png'
}