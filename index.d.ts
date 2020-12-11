import { Screenshot as oScreenshot } from './src/util/Screenshot'
import { PuppetOptions as oPuppetOptions } from './src/PuppetOptions'

declare module 'screenshotr' {
	export class Screenshot extends oScreenshot {}
	export type PuppetOptions = oPuppetOptions
}