import fs from 'fs'
import { Request, Response } from 'express'
import { makePDF } from '../util/index'

const pdf = async (req: Request, res: Response) => {
	const fileName = req.params.id + '.pdf'
	const fileHeader = {
		root: './',
		headers: {
			'Content-Disposition': 'attachment;fileName=' + fileName
		},
		maxAge: 3 * (1000 * 60 * 60 * 24)// 3 days
	}

	console.log('file exists:', fs.existsSync(`pdf/'${fileName}`))
	if (fs.existsSync(`pdf/'${fileName}`)) {
		res.sendFile(fileName, fileHeader)
		console.log('file exists: ', fileName)
		return true
	}
	else {
		try {
			await makePDF(fileName)
		} catch (err) {
			res.status(500).json({ error: err })
			console.error(err)
			return false
		}
		res.sendFile(`pdf/${fileName}`, fileHeader)
		console.log('file sent: ' + fileName)
		return true
	}
}

export default pdf