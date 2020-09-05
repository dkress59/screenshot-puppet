import ParsedQuery from './ParsedQuery'

export default class Screenshot {
	width?: number;
	height?: number;
	url: string;
	link: string; // ToDo: make optional
	title: string; // ToDo: make optional
	private src: string | undefined = undefined;
	error?: unknown;
	darkMode?: boolean;
	remove?: string[];

	constructor(query: ParsedQuery) {
		this.width = query.w ? parseInt(query.w) : 0
		this.height = query.h ? parseInt(query.h) : 0
		this.url = decodeURIComponent(query.url)
    /* if (query.link)  */ this.link = query.link
    /* if (query.title)  */ this.title = query.title
		if (query.darkMode === 'true') this.darkMode = true
		if (query.remove && query.remove.length) this.remove = query.remove
	}

	get source() {
		if (this.src) return this.src
		else throw new Error('No source found for ' + this.title)
	}

	set source(src: string) {
		if (src) this.src = src
		else throw new Error('No source passed for ' + this.title)
	}
}
