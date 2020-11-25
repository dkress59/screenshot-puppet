import express from 'express'
import bodyParser from 'body-parser'
import Puppet from '.'
import { fallback } from './util/middlewares'

const PORT = 5900

const app = express()
app.use(bodyParser.json())

const getShot = Puppet()

const postShot = Puppet({ method: 'post' })

app.get('/:filename', getShot)

app.post('/:filename', postShot)

app.use(fallback)

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))