/**
 * ToDo:
 * - improve error handling (POST!)
 * - add morgan access log
 * - replace console.logs
 * - advance PDF implementation
 * - write POST from anew (?)
 *
 */

if (process.env.NODE_ENV === 'dev')
	require('dotenv').config({ path: './.env.development.local' })

import { Request, Response } from 'express'
import express from 'express'
import bodyParser from 'body-parser'
import { headers, cache, fallback } from './util/middlewares'
import update from './routes/update'
import { launchBrowser, makeScreenshot } from './util/util'
import ParsedQuery from './types/ParsedQuery'
import Screenshot from './types/Screenshot'
//import morgan from 'morgan';
import pdf from './routes/pdf'
import io from '@pm2/io'

io.init({
	tracing: {
		enabled: true,
		// Log levels: 0-disabled,1-error,2-warn,3-info,4-debug
		logLevel: 3,
	}
})


const PORT = process.env.PUPPET_PORT || 80

const app = express()

app.use(headers)
//app.use(morgan('tiny'))
app.use(bodyParser.json())
app.use('/update', update)
app.use('/', cache)

app.get('/', async (req: Request, res: Response) => {
	const image = new Screenshot(new ParsedQuery(req))

	const browser = await launchBrowser(res)

	const response = await makeScreenshot(browser, image)
	response.source
		? res.status(200).send(JSON.stringify(response))
		: image.error
			? res.status(500).send(JSON.stringify(response))
			: res.status(500).send(
				JSON.stringify({
					...image,
					error: 'Error while retreiving screen shot.',
				})
			)

	console.log('closing browser...')
	await browser.close()
	return
})

app.post('/', async (req: Request, res: Response) => {
	const { cached, needed } = req.body
	const browser = await launchBrowser(res)

	const returns = []
	const errors = []
	for await (const image of needed)
		returns.push(
			(async () => {
				try {

					const response = await makeScreenshot(browser, image)
					if (response.source)
						return response
					else
						errors.push(response)

				} catch (error) {

					console.error(error)
					errors.push({
						...image,
						error,
					})

				}
			})()
		)

	Promise.all(returns)
		.then((images) => {
			if (images.filter((i) => i && i.error !== undefined).length)
				console.log(
					'Error count:',
					images.filter((i) => i && i.error !== undefined).length
				)
			res.status(200).send(JSON.stringify([...cached, ...images]))
		})
		.catch((err) => {
			console.error(err)
			res.status(500).send(JSON.stringify({ error: err }))
		})
		.finally(() => {
			console.log('closing browser...')
			browser.close().catch((e: any) => void e)
		})
})

app.get('/pdf/:id.pdf', pdf)

app.use('/', fallback)

app.listen(PORT)
