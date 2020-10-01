import { Response } from 'express'
import { ICache } from '../types/Cache'
import ParsedQuery from '../types/ParsedQuery'
import Screenshot, { IQSC } from '../types/Screenshot'
import { client } from './browser'


export const logToConsole = (log1: unknown, log2?: unknown, log3?: unknown): void => {
	if (process.env.NODE_ENV !== 'dev') return

	console.log(log1)
	if (log2) console.log(log2)
	if (log3) console.log(log3)
	
}
export const logErrorToConsole = (log1: unknown, log2?: unknown, log3?: unknown): void => {
	if (process.env.NODE_ENV !== 'dev') return

	console.error(log1)
	if (log2) console.error(log2)
	if (log3) console.error(log3)
	
}


export const syncWithCache = async ({ image, cacheId, cached, needed, res } : {
	image: IQSC
	cacheId: string
	res?: Response
	cached?: ICache[]
	needed?: IQSC[]
}, method?: string): Promise<void> => {

	const src: string | null = await client.get(cacheId)
	const { link, title } = image

	if (method !== 'POST')
		try {
			if (!cached || !needed)
				throw new Error('cached[] and/or needed[] missing from syncWithCache.')

			if (src && src.length) {
				logToConsole('cached', cacheId)
				cached.push({
					src,
					link: link,
					title: title,
				})
			} else {
				logToConsole('needed', cacheId)
				needed.push(image as IQSC)
			}
		} catch (err) {
			logErrorToConsole(err)
			needed?.push(image as IQSC)
		}

	else
		try {
			if (!res)
				throw new Error('<Response> missing from syncWithCache.')

			if (src && src.length) {
				logToConsole('cached', cacheId)
				res.send(JSON.stringify({ src, link, title }))
				return
			} else {
				logToConsole('needed', cacheId)
			}
		} catch (err) {
			logErrorToConsole(err)
		}

}
