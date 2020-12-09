/* istanbul ignore file */
/* eslint-disable no-console */
import { cache, fallback, headers } from './util/middlewares'
import bodyParser from 'body-parser'
import express from 'express'
import screenshotR from '.'

const PORT = process.env.PORT ?? 6000
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', headers) // Check out the example middleware!
app.use('/', cache) // Check out the example middleware!

/******************************************/
const getShot = screenshotR()
const postShot = screenshotR({ method: 'post' })

app.get('/', getShot)
app.get('/:filename', getShot)

app.post('/', postShot)
/******************************************/

app.use(fallback)

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))