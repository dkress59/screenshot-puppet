"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Screenshot = void 0;
const query_string_1 = __importDefault(require("query-string"));
const mergeData = (options, data) => {
    const settings = options === null || options === void 0 ? void 0 : options.data;
    const user = data;
    if (settings && user)
        return Object.assign(Object.assign({}, settings), JSON.parse(user));
    if (user)
        return JSON.parse(user);
    if (settings)
        return settings;
};
class Screenshot {
    constructor({ params, query }, options) {
        this.w = 1024;
        this.h = 768;
        this.url = '';
        this.src = '';
        this.darkMode = false;
        this.errors = [];
        this.output = 'json';
        const { w, h, url, data, dark, remove, output } = query_string_1.default.parse(query_string_1.default.stringify(query), {
            arrayFormat: 'comma',
            parseBooleans: true,
            parseNumbers: true,
        });
        const formats = ['bin', 'jpg', 'json', 'pdf', 'png'];
        if (url) // always true
            this.url = url.substring(0, 5) === 'http:'
                ? url
                : url.substring(0, 6) === 'https:'
                    ? url
                    : 'http://' + url;
        if (remove === null || remove === void 0 ? void 0 : remove.length)
            this.remove = remove;
        this.fileName = params && params.filename && params.filename.includes('.')
            ? params.filename
                .split('.')
                .splice(0, params.filename.split('.').length - 1)
                .join('.')
            : undefined;
        if ((options === null || options === void 0 ? void 0 : options.override) === false) {
            if (options.output)
                this.output = options.output;
            if (options.data)
                this.data = options.data;
            if (options.darkMode)
                this.darkMode = true;
        }
        else {
            if (w)
                this.w = w;
            if (h)
                this.h = h;
            if (dark || (options === null || options === void 0 ? void 0 : options.darkMode) && !!dark)
                this.darkMode = true; // ToDo: reassure
            if (mergeData(options, data))
                this.data = mergeData(options, data);
            const fileExt = params && params.filename
                ? params.filename
                    .split('.')
                    .reverse()[0]
                    .toLowerCase()
                : false;
            if ((options === null || options === void 0 ? void 0 : options.output) && formats.includes(options.output))
                this.output = options.output;
            if (fileExt)
                this.output = fileExt === 'jpeg'
                    ? 'jpg'
                    : ['jpg', 'json', 'pdf', 'png'].includes(fileExt)
                        ? fileExt
                        : 'png';
            if (output && formats.includes(output))
                this.output = output;
        }
    }
}
exports.Screenshot = Screenshot;
//# sourceMappingURL=Screenshot.js.map