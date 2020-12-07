/* istanbul ignore file */
import express from 'express'
import bodyParser from 'body-parser'
import { cache, headers, fallback } from './util/middlewares'
import ScreenshotR from '.'

const PORT = process.env.PORT ?? 6000
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', headers) // Check out the example middleware!
app.use('/', cache) // Check out the example middleware!

/******************************************/
const getShot = ScreenshotR()
const postShot = ScreenshotR({ method: 'post' })

app.get('/', getShot)
app.get('/:filename', getShot)

app.post('/', postShot)
/******************************************/

app.use(fallback)

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))