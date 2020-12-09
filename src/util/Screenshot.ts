import { PuppetOptions } from '../PuppetOptions'
import { Request } from 'express'
import queryString from 'query-string'

const mergeData = (options: PuppetOptions | undefined, data: string | undefined): Record<string, unknown> | undefined => {
	const settings = options?.data
	const user = data

	if (settings && user)
		return {
			...settings,
			...JSON.parse(user) as Record<string, unknown>,
		}

	if (user)
		return JSON.parse(user) as Record<string, unknown>

	if (settings)
		return settings
}

interface PuppetQuery {
	w?: number
	h?: number
	url?: string
	data?: string // JSON.stringify(Record<string, any>)
	dark?: boolean
	remove?: string[]
	output?: 'bin' | 'jpg' | 'json' | 'pdf' | 'png'
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

	// eslint-disable-next-line sonarjs/cognitive-complexity
	constructor({ params, query }: Request, options?: PuppetOptions) {
		const { w, h, url, data, dark, remove, output }: PuppetQuery = queryString.parse(
			queryString.stringify(query as Record<string, string>), {
				arrayFormat: 'comma',
				parseBooleans: true,
				parseNumbers: true,
			}
		) 

		const formats = new Set(['bin', 'jpg', 'json', 'pdf', 'png'])

		if (url) // always true
			this.url = url.slice(0, 5) === 'http:'
				? url
				: url.slice(0, 6) === 'https:'
					? url
					: 'http://' + url

		if (remove?.length)
			this.remove = remove

		this.fileName = params?.filename
			? params.filename
				.split('.')
				.splice(0, params.filename.split('.').length - 1)
				.join('.')
			: undefined


		if (options?.override === false) {

			if (options.output)
				this.output = options.output
			if (options.data)
				this.data = options.data
			if (options.darkMode)
				this.darkMode = true

		} else {

			if (w) this.w = w
			if (h) this.h = h

			if (dark || options?.darkMode && !!dark)
				this.darkMode = true // ToDo: reassure

			if (mergeData(options, data))
				this.data = mergeData(options, data)

			const fileExt = params?.filename
				? params.filename
					.split('.')
					.reverse()[0]
					.toLowerCase()
				: false

			if (options?.output && formats.has(options.output))
				this.output = options.output
			if (fileExt)
				this.output = fileExt === 'jpeg'
					? 'jpg'
					: ['jpg', 'json', 'pdf', 'png'].includes(fileExt)
						? fileExt as 'jpg' | 'json' | 'pdf' | 'png'
						: 'png'
			if (output && formats.has(output))
				this.output = output 
		}

	}

}
