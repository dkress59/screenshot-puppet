import { Request } from 'express'
import { PuppetOptions } from './PuppetOptions'

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

	constructor({ path, query }: Request, options?: PuppetOptions) {
		const { w, h, url, data, dark, remove, output } = query as Record<string, string>

		this.url = url.substring(0, 5) === 'http:'
			? url
			: url.substring(0, 6) === 'https:'
				? url
				: 'http://' + url

		if (w) this.w = parseInt(w)
		if (h) this.h = parseInt(h)

		if (remove && typeof remove === 'string' && remove.split(',').length)
			this.remove = remove.split(',')

		const fileExt = path && path !== '/'
			? path
				.substr(1, path.length -1)
				.split('.')
				.reverse()[0]
				.toLowerCase()
			: false

		if (fileExt && ['jpg','jpeg','json','pdf','png'].indexOf(fileExt) > -1)
			this.fileName = path.substr(1, path.length -1)
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
			if (
				dark === 'true'
				|| dark === '1'
				|| options?.darkMode && dark !== 'false' && dark !== '0'
			)
				this.darkMode = true // ToDo: reassure

			const mergedData = options?.data && data
				? {
					...options.data,
					...JSON.parse(data),
				}
				: data
					? JSON.parse(data)
					: options?.data

			if (mergedData)
				this.data = mergedData

			if (output && ['b64', 'bin', 'jpg', 'json', 'pdf', 'png'].indexOf(output) > -1)
				this.output = output as 'b64' | 'bin' | 'jpg' | 'json' | 'pdf' | 'png'
			else if (fileExt)
				this.output = fileExt === 'jpg'
					? 'jpg'
					: fileExt === 'jpeg'
						? 'jpg'
						: fileExt === 'json'
							? 'json'
							: fileExt === 'pdf'
								? 'pdf'
								: 'png'
			else if (options?.output && ['b64', 'bin', 'jpg', 'json', 'pdf', 'png'].indexOf(options.output) > -1)
				this.output = options.output
		}

	}

}
