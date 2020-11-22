"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const _1 = __importDefault(require("."));
const middlewares_1 = require("./util/middlewares");
const PORT = 5900;
const app = express_1.default();
app.use(body_parser_1.default.json());
const getSC = _1.default();
const postSC = _1.default({ method: 'post' });
app.get('/', getSC);
app.post('/', postSC);
app.use(middlewares_1.fallback);
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
//# sourceMappingURL=server.js.map