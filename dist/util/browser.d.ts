import puppeteer, { Browser } from 'puppeteer';
import { Response } from 'express';
import { Screenshot } from '../types/Screenshot';
export declare const launchBrowser: (res?: Response<any> | undefined, timeout?: number | undefined) => Promise<Browser>;
export declare const makeScreenshot: (browser: Browser, image: Screenshot, options?: puppeteer.ScreenshotOptions | puppeteer.PDFOptions | undefined) => Promise<Screenshot>;
//# sourceMappingURL=browser.d.ts.map