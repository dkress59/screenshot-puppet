/* istanbul ignore file */
import express from 'express'
import bodyParser from 'body-parser'
import Puppet from '.'
import { fallback } from './util/middlewares'

const PORT = process.env.PORT ?? 6000

const app = express()
app.use(bodyParser.json())

const getShot = Puppet()

const postShot = Puppet({ method: 'post' })

app.get('/', getShot)
app.get('/:filename', getShot)

app.post('/', postShot)
app.post('/:filename', postShot)

app.use(fallback)

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))