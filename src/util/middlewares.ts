import { Request, Response, NextFunction } from 'express'
import { ICache } from '../types/Cache'
import ParsedQuery from '../types/ParsedQuery'
import Screenshot, { IQSC } from '../types/Screenshot'
import { client } from './browser'
import { syncWithCache } from './util'

const ALLOW_ACCESS = process.env.PUPPET_ACCESS || '*'

export const headers = (req: Request, res: Response, next: NextFunction): void => {
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	)
	res.header('Access-Control-Allow-Origin', ALLOW_ACCESS)
	res.header('Access-Control-Allow-Methods', '*')
	//res.header("Cache-Control", "private, max-age=" + 60*60*24 * 30) // for later
	res.header('Cache-Control', 'private, max-age=1')
	res.type('application/json')
	next()
}

const needed: IQSC[] = []
const cached: ICache[] = []

export const cache = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<unknown> | undefined> => {
	if (req.path.length && req.path !== '/')
		next()

	else
		switch (req.method) {
		default:
			next()
			break

		case 'POST':
			if (!req.body || req.body == {})
				return res
					.status(402)
					.send({ error: 'Nothing passed in the request body.' })

			for await (const image of req.body) {
				const cacheId = `${image.link}-${image.w}x${image.h}`
				await syncWithCache({ image, cacheId, cached, needed }, 'POST')
			}
			if (!needed || !needed.length || cached.length === req.body.length)
				return res.send(JSON.stringify(cached) as string)

			req.body = { cached, needed }
			next()
			break

		case 'GET': {
			const image = req.query as unknown as IQSC
			if (!image || !Object.entries(req.query).length)
				return res.status(400).send({ error: 'Required param(s) missing.' })

			const { w, h, link } = image
			const cacheId = `${link}-${w}x${h}`
			syncWithCache({ image, cacheId, res })

			next()
			break
		}

		}
}

export const fallback = (req: Request, res: Response): Response<unknown> => {
	if (req.method === 'OPTIONS') res.status(200).end()

	return res
		.status(400)
		.send({ error: `${req.method} forbidden for this route.` })
}
