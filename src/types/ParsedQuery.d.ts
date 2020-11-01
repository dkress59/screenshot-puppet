import { Request } from 'express'

export default class ParsedQuery {
	public w?: string
	public h?: string
	public url = ''
	public link = '' // ToDo: make optional
	public title = '' // ToDo: make optional
	public darkMode?: string
	public remove?: string[]

	constructor({ query }: Request) {
		const { w, h, url, link, title, darkMode, remove } = query
		if (w) this.w = w.toString()
		if (h) this.h = h.toString()
		if (url) this.url = url.toString()
		if (link) this.link = link.toString()
		if (title) this.title = title.toString()
		if (darkMode) this.darkMode = darkMode.toString()
		if (remove && remove.split(',').length) // wtf
			this.remove = req.query.remove.split(',')
		else
			this.remove = []
	}
}
