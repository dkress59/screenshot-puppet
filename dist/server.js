"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/* istanbul ignore file */
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const middlewares_1 = require("./util/middlewares");
const _1 = __importDefault(require("."));
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 6000;
const app = express_1.default();
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use(middlewares_1.headers);
/**********************************************/
const getShot = _1.default({ middleware: middlewares_1.cache }); // check out the example middleware!
const postShot = _1.default({ method: 'post', middleware: middlewares_1.cache });
app.get('/', getShot);
app.get('/:filename', getShot);
app.post('/', postShot);
/**********************************************/
app.use(middlewares_1.fallback);
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
//# sourceMappingURL=server.js.map