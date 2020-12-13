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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
exports.launchBrowser = (res, options) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.makeScreenshot = (browser, image, options) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
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
            try {
                for (var remove_1 = __asyncValues(remove), remove_1_1; remove_1_1 = yield remove_1.next(), !remove_1_1.done;) {
                    const sel = remove_1_1.value;
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
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (remove_1_1 && !remove_1_1.done && (_a = remove_1.return)) yield _a.call(remove_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        //page.waitForTimeout(20)
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
//# sourceMappingURL=browser.js.map