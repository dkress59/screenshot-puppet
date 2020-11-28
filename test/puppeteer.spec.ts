import 'expect-puppeteer'

describe('ddg.png', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:5900/ddg.png?url=duckduckgo.com')
	})

	it('matches snapshot', async () => {
		await expect(page.content()).resolves.toMatchSnapshot()
	})
})