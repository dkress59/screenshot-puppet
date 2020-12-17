import { NextFunction, Request, Response } from 'express'
import { Screenshot } from './Screenshot'

export const fallback = (req: Request, res: Response): Response<unknown> => {
	if (req.method === 'OPTIONS') res.status(200).end()

	return res
		.status(401)
		.send({ error: `${req.method} forbidden for this route.` })
}

/* istanbul ignore next */
export const headers = (_req: Request, res: Response, next: NextFunction): void => {
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	)
	res.header('Access-Control-Allow-Origin', process.env.ALLOW_ACCESS ?? '*')
	res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')
	res.header('Cache-Control', 'private, max-age=1')
	next()
}

export const cache = async (req: Request, res: Response): Promise<string | false | null> => {
	const needed: Screenshot[] = []
	const cached: Screenshot[] = []
	
	/* if (req.path && req.path !== '/')
		next()

	else */
	switch (req.method) {

		default:
			return null


		case 'GET': {
			const image = req.query
			if (!image || !('url' in image)) {
				res.status(400).send({ error: 'Required param(s) missing.' })
				return false
			}
	
			// Your cache retreival method here!
			const cache = await 'cached img.src'
			if (cache)
				return cache
			
			return null
		}


		case 'POST':
			if (!req.body || req.body === {}) {
				res
					.status(402)
					.send({ error: 'Nothing passed in the request body.' })
				return false
			}

			// Your cache retreival method here!
			for await (const image of req.body) {
				await needed.push(image)
			}

			req.body = { cached, needed }
			return null

	}
}
