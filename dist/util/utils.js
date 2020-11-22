"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logErrorToConsole = exports.logToConsole = void 0;
exports.logToConsole = (log1, log2, log3) => {
    if (process.env.NODE_ENV !== 'development')
        return;
    if (!log1)
        return false;
    log3
        ? console.log(log1, log2, log3)
        : log2
            ? console.log(log1, log2)
            : console.log(log1);
};
exports.logErrorToConsole = (log1, log2, log3) => {
    if (process.env.NODE_ENV !== 'development')
        return;
    if (!log1)
        return false;
    log3
        ? console.error(log1, log2, log3)
        : log2
            ? console.error(log1, log2)
            : console.error(log1);
};
//# sourceMappingURL=utils.js.map