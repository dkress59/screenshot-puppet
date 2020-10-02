import { Request, Response } from 'express'
import { makePDF, client } from '../util/browser'
import { logToConsole } from '../util/utils'

const pdf = async (req: Request, res: Response): Promise<true | Response<unknown>> => {

	const cacheTime = 60 * 60 * 24 * 3
	const fileName = req.params.id + '.pdf'
	const cached: boolean = await client.exists(`lv-pdf/${fileName}`)
	const fileHeaders = [
		'Content-Disposition', 'attachment;fileName=' + fileName,
		'Cache-Control', `maxage=${cacheTime}`
	]
	logToConsole(`file ${fileName} exists: ${cached}`)


	if (cached) {
		const file = await client.get(`lv-pdf/${fileName}`)
		res
			.header(fileHeaders[0], fileHeaders[1])
			.header(fileHeaders[2], fileHeaders[3])
			.send(Buffer.from(file, 'base64'))
		logToConsole(`file ${fileName} sent.`)
		return true
	}

	else {
		const file = await makePDF(fileName)
		if (!file)
			return res.status(500).json({ error: 'File not found.' })

		res
			.header(fileHeaders[0], fileHeaders[1])
			.header(fileHeaders[2], fileHeaders[3])
			.send(file)

		logToConsole(`file ${fileName} sent.`)
		return true
	}

	
}

export default pdf