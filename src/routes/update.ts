import { Request, Response } from 'express'
import shell from 'shelljs'

const update = (req: Request, res: Response): void => {
	if (req.query.v === 'fe') {
		shell.cd('/var/www/dkress-mmxx')
		if (shell.exec('/var/www/dkress-mmxx/update.sh').code !== 0) {
			res.status(500).send({ error: 'Update failed.' })
		} else {
			res.status(200).send({ message: 'Update complete.' })
			setTimeout(() => shell.exec('/usr/local/bin/pm2 reload ecosystem.config.js --env production'), 100)
		}
	} else {
		shell.cd('/var/www/screenshot-puppet')
		if (shell.exec('/var/www/screenshot-puppet/update.sh').code !== 0) {
			res.status(500).send({ error: 'Update failed.' })
		} else {
			res.send({ message: 'Update complete.' })
			setTimeout(() => shell.exec('/usr/local/bin/pm2 reload ecosystem.config.js'), 100)
		}
	}
}

export default update
