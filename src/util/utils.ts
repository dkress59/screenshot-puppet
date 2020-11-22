import { Response } from 'express'
import { Cache } from '../types/Cache'
import { Screenshot } from '../types/Screenshot'
import { client } from './browser'


export const logToConsole = (log1: unknown, log2?: unknown, log3?: unknown): void | false => {
	if (process.env.NODE_ENV !== 'development') return
	if (!log1) return false

	log3
		? console.log(log1, log2, log3)
		: log2
			? console.log(log1, log2)
			: console.log(log1)
	
}
export const logErrorToConsole = (log1: unknown, log2?: unknown, log3?: unknown): void | false => {
	if (process.env.NODE_ENV !== 'development') return
	if (!log1) return false

	log3
		? console.error(log1, log2, log3)
		: log2
			? console.error(log1, log2)
			: console.error(log1)
	
}


export const syncWithCache = async ({ image, cacheId, cached, needed, res } : {
	image: Screenshot
	cacheId: string
	res?: Response
	cached?: Cache[]
	needed?: Screenshot[]
}, method?: string): Promise<void|true> => {

	const src: string | null = await client.get(cacheId)
	const { link, title } = image

	if (method !== 'POST')
		// GET
		try {
			if (!res)
				throw new Error('<Response> missing from syncWithCache.')

			if (src && src.length) {
				logToConsole('cached', cacheId)
				res.type('application/json')
				res.send(JSON.stringify({ src, link, title }))
				return true
			} else {
				logToConsole('needed', cacheId)
			}
		} catch (err) {
			logErrorToConsole(err)
		}

	else
		// POST
		try {
			if (!cached || !needed)
				throw new Error('cached[] and/or needed[] missing from syncWithCache.')

			if (src && src.length) {
				logToConsole('cached', cacheId)
				cached.push({
					src,
					link: link ?? '',
					title: title ?? '',
				})
			} else {
				logToConsole('needed', cacheId)
				needed.push(image)
			}
		} catch (err) {
			logErrorToConsole(err)
			needed?.push(image)
		}

}
