import screenshotR, { Screenshot as oScreenshot, PuppetOptions as oPuppetOptions } from './src'
declare module 'screenshotr' {
	export type Screenshot = oScreenshot
	export type PuppetOptions = oPuppetOptions
	export default screenshotR
}