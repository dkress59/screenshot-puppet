import { Request, Response, NextFunction } from 'express'
import { client } from '../util'

const ALLOW_ACCESS = process.env.PUPPET_ACCESS || '*'

export const headers = (_req: Request, res: Response, next: NextFunction) => {
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	)
	res.header('Access-Control-Allow-Origin', ALLOW_ACCESS)
	res.header('Access-Control-Allow-Methods', '*')
	//res.header("Cache-Control", "private, max-age=" + 60*60*24 * 30)
	res.header('Cache-Control', 'private, max-age=1')
	res.type('application/json')
	next()
}

export const cache = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
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

				const needed = []
				const cached = []
				for await (const image of req.body) {
					const cacheId = `${image.link}-${image.w}x${image.h}`
					try {
						const isCached = await client.get(cacheId)
						if (isCached && isCached.length) {
							console.log('cached', cacheId)
							cached.push({
								src: isCached,
								link: image.link,
								title: image.title,
							})
						} else {
							console.log('needed', cacheId)
							needed.push(image)
						}
					} catch (err) {
						console.error(err)
						needed.push(image)
					}
				}
				if (!needed || !needed.length || cached.length === req.body.length)
					return res.send(JSON.stringify(cached))

				req.body = { cached, needed }
				next()
				break

			case 'GET':
				const image = req.query
				if (!image || !Object.entries(req.query).length)
					return res.status(400).send({ error: 'Required param(s) missing.' })

				const { w, h, link, title } = image
				const cacheId = `${link}-${w}x${h}`
				try {
					const src = await client.get(cacheId)
					if (src && src.length) {
						console.log('cached', cacheId)
						return res.send(JSON.stringify({ src, link, title }))
					} else {
						console.log('needed', cacheId)
					}
				} catch (err) {
					console.error(err)
				}

				next()
				break
		}
}

export const fallback = (req: Request, res: Response) => {
	if (req.method === 'OPTIONS') res.status(200).end()

	return res
		.status(400)
		.send({ error: `${req.method} forbidden for this route.` })
}
