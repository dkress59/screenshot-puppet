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
exports.cache = exports.headers = exports.fallback = void 0;
const fallback = (req, res) => {
    if (req.method === 'OPTIONS')
        res.status(200).end();
    return res
        .status(401)
        .send({ error: `${req.method} forbidden for this route.` });
};
exports.fallback = fallback;
/* istanbul ignore next */
const headers = (_req, res, next) => {
    var _a;
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Origin', (_a = process.env.ALLOW_ACCESS) !== null && _a !== void 0 ? _a : '*');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.header('Cache-Control', 'private, max-age=1');
    next();
};
exports.headers = headers;
const cache = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    const needed = [];
    const cached = [];
    /* if (req.path && req.path !== '/')
        next()

    else */
    switch (req.method) {
        default:
            next();
            break;
        case 'GET': {
            const image = req.query;
            if (!image || !('url' in image))
                return res.status(400).send({ error: 'Required param(s) missing.' });
            // Your cache retreival method here!
            const cache = null;
            if (!cache)
                next();
            break;
        }
        case 'POST':
            if (!req.body || req.body === {})
                return res
                    .status(402)
                    .send({ error: 'Nothing passed in the request body.' });
            try {
                // Your cache retreival method here!
                for (var _b = __asyncValues(req.body), _c; _c = yield _b.next(), !_c.done;) {
                    const image = _c.value;
                    needed.push(image);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            /* if (!needed || !needed.length || cached.length === req.body.length)
                return res.send(JSON.stringify(cached) as string) */
            req.body = { cached, needed };
            next();
            break;
    }
});
exports.cache = cache;
//# sourceMappingURL=middlewares.js.map