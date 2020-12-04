import { NextFunction, Request, Response } from 'express'
import { Screenshot } from './Screenshot'

export const fallback = (req: Request, res: Response): Response<unknown> => {
	if (req.method === 'OPTIONS') res.status(200).end()

	return res
		.status(401)
		.send({ error: `${req.method} forbidden for this route.` })
}

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

export const cache = async (req: Request, res: Response, next: NextFunction): Promise<Response<unknown> | undefined> => {
	const needed: Screenshot[] = []
	const cached: Screenshot[] = []
	
	if (req.path && req.path !== '/')
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
					// Your cache retreival method here!
					needed.push(image)
				}
				if (!needed || !needed.length || cached.length === req.body.length)
					return res.send(JSON.stringify(cached) as string)

				req.body = { cached, needed }
				next()
				break


			case 'GET': {
				const image = req.query
				if (!image || !('url' in image))
					return res.status(400).send({ error: 'Required param(s) missing.' })

				// Your cache retreival method here!
				const cache = null
				if (!cache)
					next()

				break
			}

		}
}
