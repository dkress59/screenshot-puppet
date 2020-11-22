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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouteScreenshot = exports.postRouteScreenshot = void 0;
const utils_1 = require("../util/utils");
const browser_1 = require("../util/browser");
const Screenshot_1 = require("../types/Screenshot");
exports.postRouteScreenshot = (req, res, options) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    res.type('application/json');
    const { cached, needed } = req.body;
    const browser = yield browser_1.launchBrowser(res);
    const returns = [];
    const errors = [];
    try {
        for (var needed_1 = __asyncValues(needed), needed_1_1; needed_1_1 = yield needed_1.next(), !needed_1_1.done;) {
            const image = needed_1_1.value;
            returns.push((() => __awaiter(void 0, void 0, void 0, function* () {
                const img = new Screenshot_1.Screenshot(image);
                try {
                    const response = yield browser_1.makeScreenshot(browser, img, options === null || options === void 0 ? void 0 : options.screenshot);
                    if (response.src)
                        return response;
                    else
                        errors.push(response);
                }
                catch (error) {
                    img.error = error;
                    utils_1.logErrorToConsole(error);
                    errors.push(img);
                }
            }))());
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (needed_1_1 && !needed_1_1.done && (_a = needed_1.return)) yield _a.call(needed_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    Promise.all(returns)
        .then((images) => {
        if (options === null || options === void 0 ? void 0 : options.callback)
            options.callback(images);
        if (images.filter((i) => i && i.error !== undefined).length)
            res.status(200).send(JSON.stringify([...cached, ...images]));
    })
        .catch((err) => {
        utils_1.logErrorToConsole(err);
        res.status(500).send(JSON.stringify({ error: err }));
    })
        .finally(() => {
        utils_1.logToConsole('closing browser...');
        browser.close().catch((e) => void e);
    });
});
exports.getRouteScreenshot = (req, res, options) => __awaiter(void 0, void 0, void 0, function* () {
    res.type('application/json');
    const image = new Screenshot_1.Screenshot(req);
    const browser = yield browser_1.launchBrowser(res);
    const response = yield browser_1.makeScreenshot(browser, image, options === null || options === void 0 ? void 0 : options.screenshot);
    if (options === null || options === void 0 ? void 0 : options.callback)
        options.callback(response);
    response.src
        ? res.status(200).send(JSON.stringify(response))
        : image.error.length
            ? res.status(500).send(JSON.stringify(response))
            : res.status(500).send(JSON.stringify(Object.assign(Object.assign({}, image), { error: 'Error while retreiving screen shot.' })));
    utils_1.logToConsole('closing browser...');
    yield browser.close();
    return;
});
//# sourceMappingURL=index.js.map