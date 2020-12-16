# screenshotR

![Test Coverage](https://github.com/dkress59/screenshot-puppet/workflows/Test%20Coverage/badge.svg?branch=module) [![codecov](https://codecov.io/gh/dkress59/screenshot-puppet/branch/module/graph/badge.svg?token=NEOGL6B5FF)](https://codecov.io/gh/dkress59/screenshot-puppet)

A nifty [Express](https://expressjs.com) tool for [Node.js](https://nodejs.org/) to deliver screen shots using [Puppeteer](https://pptr.dev) on headless chromium.

With screenshotR you can… _ToDo_

## How to use

### Installation

You will need to have express installed in your repository. If you do not yet have it:

`yarn add express` or `npm install express`

Then you can install screenshotR:

`yarn add screenshotr` or `npm install screenshotr`

### Basic Example ([src/server.ts](https://github.com/dkress59/screenshot-puppet/blob/module/src/server.ts))

```ts
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

/***********************************/

const getShot = screenshotR()
const postShot = screenshotR('post')

app.get('/', getShot)
app.get('/:filename', getShot)

app.post('/', postShot)

/***********************************/

app.use(fallback)

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
```

### Configuration

#### Options

_ToDo_

#### Express

screenshotR is not a express middleware, it is an end point to an express route. _ToDo_

##### GET routes

The only required parameter for a GET route using screenshotR is `?url=` …
_ToDo_

##### POST routes

screenshotR expects the body of the request to be constructed as a dictionary of two lists, `cached` and `needed`:

```ts
{
 cached: Screenshot[],
 needed: ShotQuery[],
}
```

You can either write your own middleware to implement a cacheing mechanism before taking the screen shots, or else you can just directly pass a list of [ShotQuery](https://github.com/dkress59/screenshot-puppet/blob/module/src/types.ts#L37)s to screenshotR in your POST request, e.g.:

```json
{
 "needed": [
  { "url": "https://github.com" },
  { "url": "https//duckduckgo.com" },
 ]
}
```

The `data` query parameter is mainly designed to be used as an identifier or to provide an ability to enrichen the (json) response object with meta data:

###### Request

```json
{
 "needed": [
  { "data": "{id:1,title:\"GitHub\"}", "url": "https://github.com" },
 ]
}
```

###### Response

```json
[{
 "data": {
  "id": 1,
  "title": "GitHub"
 },
 "src": "<base64.string>",
 "url": "https://github.com",
}]
```

_ToDo_

#### Cacheing

_ToDo_

___

## ToDo

- [ ] rename: screenshooter <–> screenshotRoute
- [X] make options individually overridable
  - [ ] improve return_url
- [X] improve ShotQuery (query/body)
- [X] rename ShotQuery, ShotOptions, …
- [X] export parseShotQuery(req:Express.Request)
- [ ] README.md
- [ ] merge branch
- [ ] implement [puppet.connect()](https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-puppeteerconnectoptions)
