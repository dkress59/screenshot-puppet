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
const routes_1 = require("./routes");
const ScreenshotPuppet = (options) => {
    if (options === 'post' || typeof options === 'object' && 'method' in options && options.method === 'post')
        return (req, res) => __awaiter(void 0, void 0, void 0, function* () { return yield routes_1.postRouteScreenshot(req, res, typeof options === 'object' ? options : undefined); });
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () { return yield routes_1.getRouteScreenshot(req, res, typeof options === 'object' ? options : undefined); });
};
exports.getScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () { return yield routes_1.getRouteScreenshot(req, res); });
exports.postScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () { return yield routes_1.postRouteScreenshot(req, res); });
exports.default = ScreenshotPuppet;
//# sourceMappingURL=index.js.map