import util from 'util'
const redis = require('redis')
const REDIS = process.env.PUPPET_REDIS || 'redis://127.0.0.1:6379'

export const client = redis.createClient(REDIS)
client.get = util.promisify(client.get)
client.setex = util.promisify(client.setex)

import puppeteer, { Browser } from 'puppeteer'
import { Response } from 'express'

export const launchBrowser = async (res: Response): Promise<Browser> => {
	const browser = await puppeteer
		.launch({
			timeout: 666,
			//handleSIGINT: false,
			defaultViewport: null,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		})
		.catch((e: any) => {
			res
				.status(500)
				.send({ error: 'error launching puppeteer: ' + e.toString() })
			throw new Error('error launching puppeteer: ' + e.toString())
		})

	return browser
}
