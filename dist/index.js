"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.postScreenshot = exports.getScreenshot = exports.Screenshot = void 0;
const routes_1 = require("./screenshot/routes");
__exportStar(require("./types"), exports);
var Screenshot_1 = require("./util/Screenshot");
Object.defineProperty(exports, "Screenshot", { enumerable: true, get: function () { return Screenshot_1.Screenshot; } });
function screenshotR(options) {
    const validOptions = typeof options === 'object'
        ? options
        : undefined;
    if (options === 'post'
        || typeof options === 'object' && 'method' in options && options.method === 'post')
        return (req, res) => __awaiter(this, void 0, void 0, function* () { return yield routes_1.postScreenshotRoute(req, res, validOptions); });
    return (req, res) => __awaiter(this, void 0, void 0, function* () { return yield routes_1.getScreenshotRoute(req, res, validOptions); });
}
exports.default = screenshotR;
exports.getScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () { return yield routes_1.getScreenshotRoute(req, res); });
exports.postScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () { return yield routes_1.postScreenshotRoute(req, res); });
//# sourceMappingURL=index.js.map