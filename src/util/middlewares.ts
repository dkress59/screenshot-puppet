import { Request, Response } from 'express'

export const fallback = (req: Request, res: Response): Response<unknown> => {
	if (req.method === 'OPTIONS') res.status(200).end()

	return res
		.status(401)
		.send({ error: `${req.method} forbidden for this route.` })
}
