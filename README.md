# ScreenshotR

![Test Coverage](https://github.com/dkress59/screenshot-puppet/workflows/Test%20Coverage/badge.svg?branch=module) [![codecov](https://codecov.io/gh/dkress59/screenshot-puppet/branch/module/graph/badge.svg?token=NEOGL6B5FF)](https://codecov.io/gh/dkress59/screenshot-puppet)

A nifty [express](https://expressjs.com) tool to deliver screen shots using [puppeteer](https://pptr.dev) on headless chromium.

## Installation

1. ToDo

## How to use

- ToDo

<!-- ### Express

### Options

### Caching -->

#### Basic Example ([src/server.ts](https://github.com/dkress59/screenshot-puppet/blob/module/src/server.ts))

```js
import express from 'express'
import bodyParser from 'body-parser'
import { cache, headers, fallback } from './util/middlewares'
import ScreenshotR from '@dkress/screenshotr'

const PORT = process.env.PORT ?? 6000
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', headers) // Check out the example middleware!
app.use('/', cache) // Check out the example middleware!

/******************************************/
const getShot = ScreenshotR()
const postShot = ScreenshotR('post')

app.get('/', getShot)
app.get('/:filename', getShot)

app.post('/', postShot)
/******************************************/

app.use(fallback)

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
```

___

### ToDo

- [X] bin === Buffer
  - [X] test
- [X] add callback (e.g. for redis)
- [X] add options (URLs, ports?, …)
  - [X] make all options overridable
  - [ ] make options individually overridable
- [X] advance return/output logic
  - [X] refine returns
- [X] re-evaluate error handling
- [X] advance PDF implementation
- [X] add unit tests
- [X] add dev setup
- [X] improve utils.ts
- [X] improve POST
  - [X] force JSON
- [X] improve PDF
  - [X] test PDF
- [ ] improve PuppetQuery (query/body)
- [ ] README.md
- [ ] custom matcher for [index.ts](https://github.com/dkress59/screenshot-puppet/blob/module/src/index.ts) tests
- [ ] implement [puppet.connect()](https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-puppeteerconnectoptions)
