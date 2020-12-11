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
Object.defineProperty(exports, "__esModule", { value: true });
exports.postScreenshot = exports.getScreenshot = void 0;
const routes_1 = require("./screenshot/routes");
function screenshotR(options) {
    const validOptions = typeof options === 'object'
        ? options
        : undefined;
    if (options === 'post'
        || typeof options === 'object' && 'method' in options && options.method === 'post')
        /* istanbul ignore next */ // TODO
        return (req, res) => __awaiter(this, void 0, void 0, function* () { return yield routes_1.postScreenshotRoute(req, res, validOptions); });
    /* istanbul ignore next */ // TODO
    return (req, res) => __awaiter(this, void 0, void 0, function* () { return yield routes_1.getScreenshotRoute(req, res, validOptions); });
}
exports.default = screenshotR;
exports.getScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () { 
/* istanbul ignore next */ // TODO
return yield routes_1.getScreenshotRoute(req, res); });
exports.postScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () { 
/* istanbul ignore next */ // TODO
return yield routes_1.postScreenshotRoute(req, res); });
//# sourceMappingURL=index.js.map