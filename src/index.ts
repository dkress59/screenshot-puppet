/**
 * ToDo:
 * - [ ] re-evaluate error handling
 * - [X] advance PDF implementation
 * - [ ] advance README.md
 * - [ ] ? add morgan access log
 * - [ ] improve PDF
 */

if (process.env.NODE_ENV === 'development')
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require('dotenv').config({ path: './.env.development.local' })

import { getSC, postSC } from './routes/screenshot'
import express from 'express'
import bodyParser from 'body-parser'

import { headers, cache, fallback } from './util/middlewares'
import { pdf, update } from './routes'


//import morgan from 'morgan'
import io from '@pm2/io'
io.init({
	tracing: {
		enabled: true,
	}
})


const PORT = process.env.PUPPET_PORT || 80
const app = express()

app.use(headers)
//app.use(morgan('tiny'))
app.use(bodyParser.json())
app.use('/update', update)
app.use('/', cache)


app.get('/', getSC)


app.post('/', postSC)


app.get('/pdf/:id.pdf', pdf)

app.use('/', fallback)

app.listen(PORT)
