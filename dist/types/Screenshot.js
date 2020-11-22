"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Screenshot = void 0;
class Screenshot {
    constructor({ path, query }) {
        var _a;
        this.w = 1024;
        this.h = 768;
        this.url = '';
        this.darkMode = false;
        this.error = [];
        this.output = 'jpg';
        const { w, h, url, link, title, darkMode, remove } = query;
        this.url = url;
        if (w)
            this.w = parseInt(w);
        if (h)
            this.h = parseInt(h);
        if (link)
            this.link = link;
        if (title)
            this.title = title;
        if (darkMode && darkMode === 'true')
            this.darkMode = true; // ToDo: reassure
        if (remove && typeof remove === 'string' && remove.split(',').length)
            this.remove = remove.split(',');
        const fileExt = (_a = path.split('.')) === null || _a === void 0 ? void 0 : _a.reverse()[0].toLowerCase();
        if (fileExt && ['jpg', 'jpeg', 'json', 'pdf', 'png'].indexOf(fileExt) > -1) {
            this.fileName = path.split('.').splice(-1, 1).join('.');
        }
        this.output = fileExt === 'jpg'
            ? 'jpg'
            : fileExt === 'jpeg'
                ? 'jpg'
                : fileExt === 'json'
                    ? 'json'
                    : fileExt === 'pdf'
                        ? 'pdf'
                        : 'png';
    }
}
exports.Screenshot = Screenshot;
/* export interface ScreenshotOptions extends PDFOptions {
    encoding?: 'base64' | 'binary' // ToDo: compare with .toString('base64')
    type?: 'jpeg' | 'png'
    //path?: string // caution: can save to disk
    quality?: undefined | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100
} */
//# sourceMappingURL=Screenshot.js.map