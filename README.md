# Screenshot Puppet

![Test Coverage](https://github.com/dkress59/screenshot-puppet/workflows/Test%20Coverage/badge.svg?branch=module) [![codecov](https://codecov.io/gh/dkress59/screenshot-puppet/branch/module/graph/badge.svg?token=NEOGL6B5FF)](https://codecov.io/gh/dkress59/screenshot-puppet)

A nifty [express](https://expressjs.com) tool to deliver screen shots using [puppeteer](https://pptr.dev) on headless chromium.

## Installation

1. ToDo

## How to use

- ToDo
- for now, see [src/server.ts](https://github.com/dkress59/screenshot-puppet/blob/module/src/server.ts)

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
- [ ] re-evaluate error handling
- [X] advance PDF implementation
- [ ] --add morgan access log (?)--
- [X] add unit tests
- [X] add dev setup
- [X] improve utils.ts
- [ ] improve POST
  - [X] force JSON
- [X] improve PDF
  - [X] test PDF
- [ ] outsource port declarations to env
- [ ] README.md
- [ ] custom matcher for [index.ts](https://github.com/dkress59/screenshot-puppet/blob/module/src/index.ts) tests
- [ ] implement [puppet.connect()](https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-puppeteerconnectoptions)

![Coverage Graph](https://codecov.io/gh/dkress59/screenshot-puppet/branch/module/graphs/sunburst.svg)
