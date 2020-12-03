import Puppet from '../src'

describe('Puppet', () => {
	it('works', () => {
		expect(Puppet()).toBeTruthy()
		expect(Puppet('get')).toBeTruthy()
		expect(Puppet({ method: 'post' })).toBeTruthy()
		// expect(Puppet(undefined)).toBeTruthy()
		// expect(Puppet({method: 'get'})).toBeTruthy()
		// expect(Puppet({method: 'post'})).toBeTruthy()
	})
	// + mockGetRouteScreenshot
	// + mockPostRouteScreenshot
})
