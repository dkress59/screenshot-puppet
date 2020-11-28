import { Request, Response } from 'express'
import Puppet from '../src'

const getShot = Puppet()

const postShot = Puppet({ method: 'post' })


describe('Puppet', () => {
	it('works', () => {
		expect(postShot).toBeTruthy()
	})
})