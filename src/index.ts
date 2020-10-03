/**
 * ToDo:
 * - re-evaluate error handling
 * - advance PDF implementation
 * - advance README.md
 * - ? add morgan access log
 */

if (process.env.NODE_ENV === 'development')
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require('dotenv').config({ path: './.env.development.local' })

import { Request, Response } from 'express'
import express from 'express'
import bodyParser from 'body-parser'

import { headers, cache, fallback } from './util/middlewares'
import { pdf, screenshotRoute, update } from './routes'


//import morgan from 'morgan' // for later
import io from '@pm2/io'
io.init({
	tracing: {
		enabled: true,
	}
})


const { getRouteScreenshot, postRouteScreenshot } = screenshotRoute
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
