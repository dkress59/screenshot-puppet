import { Request } from 'express'

export class Screenshot {

	public w = 1024
	public h = 768
	public url = ''
	public src?: string
	public data?: unknown
	public fileName?: string
	public darkMode = false
	public remove?: string[]
	public error: unknown[] = []
	public output: 'b64' | 'bin' | 'jpg' | 'json' | 'pdf' | 'png'  = 'json'

	constructor({ path, query }: Request) {
		const { w, h, url, data, darkMode, remove } = query
		this.url = url as string

		if (w) this.w = parseInt(w as string)
		if (h) this.h = parseInt(h as string)
		if (data) this.data = data
		if (darkMode && darkMode === 'true') this.darkMode = true // ToDo: reassure

		if (remove && typeof remove === 'string' && remove.split(',').length)
			this.remove = remove.split(',')

		const fileExt = path.split('.')?.reverse()[0].toLowerCase()
		if (fileExt && ['jpg','jpeg','json','pdf','png'].indexOf(fileExt) > -1) {
			this.fileName = path.split('.').splice(-1,1).join('.')}

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
