import screenshotR, { Screenshot as oScreenshot, ShotOptions as oShotOptions } from './src'
declare module 'screenshotr' {
	export type Screenshot = oScreenshot
	export type ShotOptions = oShotOptions
	export default screenshotR
}