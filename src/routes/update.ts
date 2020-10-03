import { Request, Response } from 'express'
import shell from 'shelljs'

const update = (req: Request, res: Response): void => {

	const reloadProcess = '/usr/local/bin/pm2 reload ecosystem.config.js --env production'

	const updateComplete = () => res.status(200).send({ message: 'Update complete.' })
	const updateFailed = () => res.status(500).send({ error: 'Update failed.' })

	const makeUpdate = async(path: string): Promise<void> => {
		shell.cd(`/var/www/${path}`)
		if (await shell.exec(`/var/www/${path}/update.sh`).code !== 0) {
			updateFailed()
		} else {
			updateComplete()
			setTimeout(() => shell.exec(reloadProcess), 1000)
		}
	}

	if (req.query.v === 'fe')
		makeUpdate('dkress-mmxx')
	else
		makeUpdate('screenshot-puppet')

}

export default update
