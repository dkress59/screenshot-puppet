"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fallback = void 0;
exports.fallback = (req, res) => {
    if (req.method === 'OPTIONS')
        res.status(200).end();
    return res
        .status(400)
        .send({ error: `${req.method} forbidden for this route.` });
};
//# sourceMappingURL=middlewares.js.map