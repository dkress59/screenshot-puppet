/* istanbul ignore file */
import express from 'express'
import bodyParser from 'body-parser'
import { cache, fallback, headers } from './util/middlewares'
import screenshotR from '.'

const PORT = process.env.PORT ?? 6000
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(headers)

/**********************************************/

const getShot = screenshotR({ middleware: cache }) // check out the example middleware!
const postShot = screenshotR({ method: 'post', middleware: cache })

app.get('/', getShot)
app.get('/:filename', getShot)

app.post('/', postShot)

/**********************************************/

app.use(fallback)

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))