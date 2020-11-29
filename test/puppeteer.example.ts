import 'expect-puppeteer'
// github ci: Error: Failed to launch the browser process! spawn /__w/screenshot-puppet/screenshot-puppet/node_modules/puppeteer/.local-chromium/linux-818858/chrome-linux/chrome ENOENT

describe('ddg.png', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:5900/ddg.png?url=duckduckgo.com')
	})

	it('matches snapshot', async () => {
		await expect(page.content()).resolves.toMatchSnapshot()
	})
})