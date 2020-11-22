import { Request, Response } from 'express';
import { PuppetOptions } from './types/Puppet';
import { Screenshot as IScreenshot } from './types/Screenshot';
declare const ScreenshotPuppet: (options?: PuppetOptions | "get" | "post" | undefined) => (req: Request, res: Response) => Promise<void>;
export declare type Screenshot = IScreenshot;
export declare const getSC: (req: Request, res: Response) => Promise<void>;
export declare const postSC: (req: Request, res: Response) => Promise<void>;
export default ScreenshotPuppet;
//# sourceMappingURL=index.d.ts.map