# screenshotR

![Test Coverage](https://github.com/dkress59/screenshot-puppet/workflows/Test%20Coverage/badge.svg?branch=module) [![codecov](https://codecov.io/gh/dkress59/screenshot-puppet/branch/module/graph/badge.svg?token=NEOGL6B5FF)](https://codecov.io/gh/dkress59/screenshot-puppet)

A nifty [Express](https://expressjs.com) tool for [Node.js](https://nodejs.org/) to deliver screen shots using [Puppeteer](https://pptr.dev) on headless chromium.

## How to use

### Installation

You will need to have express installed in your repository. If you do not yet have it:

`yarn add express` or `npm install express`

Then you can install screenshotR:

`yarn add @dkress/screenshotr` or `npm install @dkress/screenshotr`

### Basic Example ([src/server.ts](https://github.com/dkress59/screenshot-puppet/blob/module/src/server.ts))

```js
import express from 'express'
import bodyParser from 'body-parser'
import { cache, headers, fallback } from './util/middlewares'
import screenshotR from 'screenshotr'

const PORT = process.env.PORT ?? 6000
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', headers) // Check out the example middleware!
app.use('/', cache) // Check out the example middleware!

/******************************************/
const getShot = screenshotR()
const postShot = screenshotR('post')

app.get('/', getShot)
app.get('/:filename', getShot)

app.post('/', postShot)
/******************************************/

app.use(fallback)

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
```

### Configuration

#### Express

_ToDo_

#### Options

_ToDo_

#### Caching

_ToDo_

___

## ToDo

- [ ] make options individually overridable
- [X] improve PuppetQuery (query/body)
- [ ] README.md
- [ ] custom matcher for [index.ts](https://github.com/dkress59/screenshot-puppet/blob/module/src/index.ts) tests
- [ ] implement [puppet.connect()](https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-puppeteerconnectoptions)
