import { Request } from 'express'
import { PuppetOptions } from './PuppetOptions'

export class Screenshot {

	public w = 1024
	public h = 768
	public url = ''
	public src?: string
	public data?: Record<string, unknown>
	public fileName?: string
	public darkMode = false
	public remove?: string[]
	public errors: unknown[] = []
	public output: 'b64' | 'bin' | 'jpg' | 'json' | 'pdf' | 'png'  = 'json'

	constructor({ path, query }: Request, options?: PuppetOptions) {
		const { w, h, url, data, darkMode, remove, output } = query as Record<string, string>

		this.url = url.substring(0, 7) === 'http://'
			? url
			: 'https://' + url

		if (w) this.w = parseInt(w)
		if (h) this.h = parseInt(h)

		if (remove && typeof remove === 'string' && remove.split(',').length)
			this.remove = remove.split(',')

		const fileExt = path && path !== '/'
			? path.substring(1, path.length - 1).split('.').reverse()[0].toLowerCase()
			: false

		if (fileExt && ['jpg','jpeg','json','pdf','png'].indexOf(fileExt) > -1) {
			this.fileName = path.split('.').splice(-1,1).join('.')}

		if (options?.override === false) {
			if (options.output)
				this.output = options?.output
			if (options.data)
				this.data = options?.data
		} else {
			if (darkMode === 'true')
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
		}

	}

}
