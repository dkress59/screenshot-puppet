import { Screenshot as oScreenshot } from './src/util/Screenshot'
import { PuppetOptions as oPuppetOptions } from './src/PuppetOptions'

declare module 'screenshotr' {
	export class Screenshot extends oScreenshot {}
	export type PuppetOptions = oPuppetOptions
	export default function screenshotR(options?: PuppetOptions | 'get' | 'post'): (req: Request, res: Response) => Promise<void> {
		return screenshotR(options)
	}
}