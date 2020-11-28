import { launchBrowser } from '../../src/screenshot/browser'
// + puppeteer mock

describe('Puppeteer Screenshot Mechanism', () => {

	describe('launching browser', () => {

		it('fails and sends error', async() => {
			const browser = await launchBrowser()

			//expect()

			await browser.close()
		})
	})
})