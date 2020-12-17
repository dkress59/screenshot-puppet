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
exports.postScreenshotRoute = exports.getScreenshotRoute = void 0;
const utils_1 = require("../util/utils");
const browser_1 = require("./browser");
const Screenshot_1 = require("../util/Screenshot");
const query_string_1 = __importDefault(require("query-string"));
const makeOriginURL = (req, options) => {
    var _a, _b;
    return (options === null || options === void 0 ? void 0 : options.return_url) ? `${options.return_url}${req.path}${(_b = (_a = req.params) === null || _a === void 0 ? void 0 : _a.filename) !== null && _b !== void 0 ? _b : ''}${req.query
        ? '?' + query_string_1.default.stringify(req.query)
        : ''}`
        : req.protocol + '://' + req.get('host') + req.originalUrl;
};
function getScreenshotRoute(req, res, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const cacheSuccess = (options === null || options === void 0 ? void 0 : options.middleware) && (yield options.middleware(req, res));
        if (cacheSuccess === false)
            return;
        const image = new Screenshot_1.Screenshot(req, options);
        if (cacheSuccess)
            image.src = cacheSuccess;
        const browser = cacheSuccess ? {} : yield browser_1.launchBrowser(res);
        const response = cacheSuccess ? image : yield browser_1.makeScreenshot(browser, image, options === null || options === void 0 ? void 0 : options.screenshot);
        if (options === null || options === void 0 ? void 0 : options.callback)
            options.callback(response);
        switch (response.output) {
            case 'bin':
                break;
            case 'jpg':
                res.type('jpg');
                break;
            case 'pdf':
                res.type('pdf');
                break;
            case 'png':
                res.type('png');
                break;
            default:
                res.type('json');
                break;
        }
        const originalUrl = makeOriginURL(req, options);
        response.output === 'json'
            ? res.status(200).send(JSON.stringify({ response, originalUrl }))
            : response.output === 'bin'
                ? res.status(200).send(response.src)
                : res.status(200).send(Buffer.from(response.src, 'base64'));
        if (cacheSuccess)
            return undefined;
        browser.close().catch((e) => void e);
        utils_1.logToConsole(`
			browser closed.
		`);
        return;
    });
}
exports.getScreenshotRoute = getScreenshotRoute;
function postScreenshotRoute(req, res, options) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        res.type('json');
        if (options === null || options === void 0 ? void 0 : options.middleware)
            yield options.middleware(req, res);
        const { cached, needed } = req.body.cached && req.body.needed
            ? req.body
            : {
                cached: [],
                needed: req.body
            };
        const browser = needed.length ? yield browser_1.launchBrowser(res) : {};
        const returns = [];
        const errors = [];
        try {
            for (var needed_1 = __asyncValues(needed), needed_1_1; needed_1_1 = yield needed_1.next(), !needed_1_1.done;) {
                const query = needed_1_1.value;
                const img = new Screenshot_1.Screenshot({ query, path: req.path }, options);
                try {
                    const response = yield browser_1.makeScreenshot(browser, img, options === null || options === void 0 ? void 0 : options.screenshot);
                    returns.push(response);
                }
                catch (error) {
                    img.errors.push(error);
                    utils_1.logErrorToConsole(error);
                    errors.push(img);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (needed_1_1 && !needed_1_1.done && (_a = needed_1.return)) yield _a.call(needed_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        const originalUrl = makeOriginURL(req, options);
        const conditionalErrors = errors.length ? { errors } : {};
        if (options === null || options === void 0 ? void 0 : options.callback)
            options.callback(returns);
        res.status(200).send(JSON.stringify(Object.assign(Object.assign({}, conditionalErrors), { originalUrl, response: [...cached, ...returns] })));
        if (!needed.length)
            return undefined;
        browser.close().catch((e) => void e);
        utils_1.logToConsole(`
		browser closed.
	`);
    });
}
exports.postScreenshotRoute = postScreenshotRoute;
//# sourceMappingURL=routes.js.map