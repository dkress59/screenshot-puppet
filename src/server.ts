import express from 'express'
import bodyParser from 'body-parser'
import ScreenshotPuppet from '.'
import { fallback } from './util/middlewares'

const PORT = 5900

const app = express()
app.use(bodyParser.json())

const getSC = ScreenshotPuppet()

const postSC = ScreenshotPuppet({ method: 'post' })

app.get('/', getSC)

app.post('/', postSC)

app.use(fallback)

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))