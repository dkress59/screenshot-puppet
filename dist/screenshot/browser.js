"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeScreenshot = exports.launchBrowser = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const utils_1 = require("../util/utils");
const qualities = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    64,
    65,
    66,
    67,
    68,
    69,
    70,
    71,
    72,
    73,
    74,
    75,
    76,
    77,
    78,
    79,
    80,
    81,
    82,
    83,
    84,
    85,
    86,
    87,
    88,
    89,
    90,
    91,
    92,
    93,
    94,
    95,
    96,
    97,
    98,
    99,
    100
];
const launchBrowser = (res, options) => __awaiter(void 0, void 0, void 0, function* () {
    process.setMaxListeners(16); // ToDo: options?
    const browser = yield puppeteer_1.default
        .launch(Object.assign(Object.assign({ timeout: 6666, defaultViewport: null, ignoreHTTPSErrors: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }, options), { headless: true }))
        .catch(/* istanbul ignore next */ (e) => {
        if (res)
            res
                .status(500)
                .send({
                message: 'error launching puppeteer',
                error: e,
            });
        throw new Error('error launching puppeteer: ' + JSON.stringify(e)); // breaks jest
    });
    return browser;
});
exports.launchBrowser = launchBrowser;
const makeScreenshot = (browser, image, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { w, h, url, darkMode, remove, output } = image;
    const encoding = (output === 'bin')
        ? 'binary'
        : 'base64';
    const type = options && ('type' in options)
        ? options.type
        : output === 'pdf'
            ? undefined
            : output === 'jpg'
                ? 'jpeg'
                : 'png';
    const quality = (options
        && 'quality' in options
        && options.quality !== undefined
        && qualities.includes(options.quality))
        ? options.quality
        : undefined;
    const safeOptions = Object.assign(Object.assign({}, options), { encoding, path: undefined, // can save to disk
        type,
        quality });
    try {
        const page = yield browser.newPage();
        yield page.setViewport({ width: w, height: h });
        if (darkMode)
            yield page.emulateMediaFeatures([{
                    name: 'prefers-color-scheme',
                    value: 'dark',
                }]);
        yield page.goto(url, {
            waitUntil: 'networkidle0'
        });
        if (remove)
            for (const sel of remove) {
                utils_1.logToConsole('remove', sel);
                try {
                    /* istanbul ignore next */
                    yield page.evaluate((sel) => {
                        const nodes = document.querySelectorAll(sel);
                        if (document.querySelectorAll(sel).length)
                            for (let i = 0; i < nodes.length; i++)
                                nodes[i].parentNode.removeChild(nodes[i]);
                    }, sel);
                }
                catch (error) {
                    image.errors.push(error);
                    utils_1.logErrorToConsole(error);
                }
            }
        const screenshot = (output === 'pdf')
            ? yield page.pdf(safeOptions)
            : yield page.screenshot(safeOptions);
        image.src = screenshot; // ToDo: test b64/bin + pdf / return string
    }
    catch (error) {
        utils_1.logToConsole(error);
        image.errors.push(error);
    }
    return image;
});
exports.makeScreenshot = makeScreenshot;
//# sourceMappingURL=browser.js.map