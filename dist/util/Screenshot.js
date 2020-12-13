"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Screenshot = void 0;
const query_string_1 = __importDefault(require("query-string"));
const isOverridable = (name, options) => {
    if (!options
        || options.override === true
        || options.override === undefined)
        return true;
    if (options.override
        && name in options.override
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        && options.override[name] === true)
        return true;
    return false;
};
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
        const formats = ['bin', 'jpg', 'json', 'pdf', 'png'];
        const { w, h, url, data, dark, remove, output } = query_string_1.default.parse(query_string_1.default.stringify(query), {
            arrayFormat: 'comma',
            parseBooleans: true,
            parseNumbers: true,
        });
        if (url) // always true
            this.url = url.substring(0, 5) === 'http:'
                ? url
                : url.substring(0, 6) === 'https:'
                    ? url
                    : 'http://' + url;
        if (w && isOverridable('width', options))
            this.w = w;
        if (h && isOverridable('height', options))
            this.h = h;
        if (remove)
            this.remove = JSON.parse(remove);
        if (params && 'filename' in params && params.filename.includes('.'))
            this.fileName = params.filename
                .split('.')
                .splice(0, params.filename.split('.').length - 1)
                .join('.');
        const fileExt = params && 'filename' in params
            ? params.filename
                .split('.')
                .reverse()[0]
                .toLowerCase()
            : false;
        if (options === null || options === void 0 ? void 0 : options.output)
            this.output = options.output;
        if (isOverridable('output', options))
            if (output && formats.includes(output))
                this.output = output;
            else if (fileExt)
                this.output = fileExt === 'jpeg'
                    ? 'jpg'
                    : ['jpg', 'json', 'pdf', 'png'].includes(fileExt)
                        ? fileExt
                        : 'png';
        if (options === null || options === void 0 ? void 0 : options.data)
            this.data = options.data;
        if (data && isOverridable('data', options))
            this.data = mergeData(options, data) ? mergeData(options, data) : JSON.parse(data);
        if (options === null || options === void 0 ? void 0 : options.darkMode)
            this.darkMode = options.darkMode;
        if (dark !== undefined && isOverridable('darkMode', options))
            this.darkMode = dark;
    }
}
exports.Screenshot = Screenshot;
//# sourceMappingURL=Screenshot.js.map