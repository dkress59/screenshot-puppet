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
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require('dotenv').config({ path: './.env.development.local' })

import { Request, Response } from 'express'
import express from 'express'
import bodyParser from 'body-parser'
import { headers, cache, fallback } from './util/middlewares'
import update from './routes/update'
import { getRouteScreenshot, postRouteScreenshot } from './util/browser'
//import morgan from 'morgan' // for later
import pdf from './routes/pdf'
import io from '@pm2/io'

io.init({
	tracing: {
		enabled: true,
	}
})


const PORT = process.env.PUPPET_PORT || 80

const app = express()

app.use(headers)
//app.use(morgan('tiny')) // for later
app.use(bodyParser.json())
app.use('/update', update)
app.use('/', cache)


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
app.get('/', async (req: Request, res: Response) => await getRouteScreenshot(req, res))


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
app.post('/', async (req: Request, res: Response) => await postRouteScreenshot(req, res))


app.get('/pdf/:id.pdf', pdf)

app.use('/', fallback)

app.listen(PORT)
