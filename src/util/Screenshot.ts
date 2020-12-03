import queryString from 'query-string'
import { Request } from 'express'
import { PuppetOptions } from '../PuppetOptions'

interface PuppetQuery {
	w?: number
	h?: number
	url?: string
	data?: string // JSON.stringify(Record<string, string>)
	dark?: boolean
	remove?: string[]
	output?: 'b64' | 'bin' | 'jpg' | 'json' | 'pdf' | 'png'
}

export class Screenshot {

	public w = 1024
	public h = 768
	public url = ''
	public src?: string | Buffer
	public data?: Record<string, unknown>
	public fileName?: string
	public darkMode = false
	public remove?: string[]
	public errors: unknown[] = []
	public output: 'b64' | 'bin' | 'jpg' | 'json' | 'pdf' | 'png'  = 'json'

	constructor({ query: expressQuery, path }: Request, options?: PuppetOptions) {
		const query: PuppetQuery = queryString.parse(
			queryString.stringify(expressQuery as Record<string, string>), {
				arrayFormat: 'comma',
				parseBooleans: true,
				parseNumbers: true,
			}
		)
		const { w, h, url, data, dark, remove, output }: PuppetQuery = query 

		const formats = ['b64', 'bin', 'jpg', 'json', 'pdf', 'png']

		if (url) // always true
			this.url = url.substring(0, 5) === 'http:'
				? url
				: url.substring(0, 6) === 'https:'
					? url
					: 'http://' + url

		if (remove?.length)
			this.remove = remove

		const fileExt = path && path !== '/'
			? path
				.substr(1, path.length -1)
				.split('.')
				.reverse()[0]
				.toLowerCase()
			: false
		if (fileExt && formats.includes(fileExt))
			this.fileName = path.substr(1, path.length - 1)
				.split('.')
				.splice(0, path.split('.').length - 1)
				.join('.')


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

			const mergedData = options?.data && data && typeof JSON.parse(data) === 'object'
				? {
					...options.data,
					...JSON.parse(data),
				}
				: data
					? data
					: options?.data

			if (mergedData)
				this.data = mergedData

			if (output && formats.includes(output))
				this.output = output as 'b64' | 'bin' | 'jpg' | 'json' | 'pdf' | 'png'
			else if (fileExt)
				this.output = fileExt === 'jpeg'
					? 'jpg'
					: ['jpg', 'json', 'pdf', 'png'].includes(fileExt)
						? fileExt as 'jpg' | 'json' | 'pdf' | 'png'
						: 'png'
			else if (options?.output && formats.includes(options.output))
				this.output = options.output
		}

	}

}
