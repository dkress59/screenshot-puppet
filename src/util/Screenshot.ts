import queryString from 'query-string'
import { Request, Response } from 'express'
import { ShotOptions } from '../types'

interface ShotQuery {
	w?: number
	h?: number
	url?: string
	data?: string // JSON.stringify(Record<string, any>)
	dark?: boolean
	remove?: string
	output?: 'bin' | 'jpg' | 'json' | 'pdf' | 'png'
}

const isOverridable = (name: string, options: ShotOptions | undefined) => {
	if (
		!options
		|| options.override === true
		|| options.override === undefined
	)
		return true

	if (
		options.override
		&& name in options.override
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		&& options.override[name] === true
	)
		return true

	return false
}

const mergeData = (options: ShotOptions | undefined, data: string | undefined): Record<string, unknown> | undefined => {
	const settings = options?.data
	const user = data

	if (settings && user)
		return {
			...settings,
			...JSON.parse(user) as Record<string, unknown>,
		}

	if (user)
		return JSON.parse(user) as Record<string, unknown>
}

export const parseShotQuery = (query: Record<string, string>): ShotQuery => {
	return queryString.parse(
		queryString.stringify(query as Record<string, string>), {
			arrayFormat: 'comma',
			parseBooleans: true,
			parseNumbers: true,
		}
	)
}

export class Screenshot {

	public w = 1024
	public h = 768
	public url = ''
	public src: string | Buffer = ''
	public data?: Record<string, unknown>
	public fileName?: string
	public darkMode = false
	public remove?: string[]
	public errors: unknown[] = []
	public output: 'bin' | 'jpg' | 'json' | 'pdf' | 'png'  = 'json'

	constructor({ params, query }: Request, options?: ShotOptions) {

		const formats = ['bin', 'jpg', 'json', 'pdf', 'png']
		const { w, h, url, data, dark, remove, output } = parseShotQuery(query as Record<string, string>)


		if (url) // always true
			this.url = url.substring(0, 5) === 'http:'
				? url
				: url.substring(0, 6) === 'https:'
					? url
					: 'http://' + url


		if (w && isOverridable('width', options)) this.w = w
		if (h && isOverridable('height', options)) this.h = h


		if (remove)
			this.remove = JSON.parse(remove)


		if (params && 'filename' in params && params.filename.includes('.'))
			this.fileName = params.filename
				.split('.')
				.splice(0, params.filename.split('.').length - 1)
				.join('.')

		const fileExt = params && 'filename' in params
			? params.filename
				.split('.')
				.reverse()[0]
				.toLowerCase()
			: false


		if (options?.output)
			this.output = options.output
		if (isOverridable('output', options))
			if (output && formats.includes(output))
				this.output = output
			else if (fileExt)
				this.output = fileExt === 'jpeg'
					? 'jpg'
					: ['jpg', 'json', 'pdf', 'png'].includes(fileExt)
						? fileExt as 'jpg' | 'json' | 'pdf' | 'png'
						: 'png'


		if (options?.data)
			this.data = options.data
		if (data && isOverridable('data', options))
			this.data = mergeData(options, data) ? mergeData(options, data) : JSON.parse(data)


		if (options?.darkMode)
			this.darkMode = options.darkMode
		if (dark !== undefined && isOverridable('darkMode', options))
			this.darkMode = dark

	}
	
}
