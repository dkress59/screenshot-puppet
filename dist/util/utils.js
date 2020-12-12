"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logWarningToConsole = exports.logErrorToConsole = exports.logToConsole = void 0;
exports.logToConsole = (...logs) => {
    if (!logs || process.env.NODE_ENV !== 'development')
        return;
    console.log(...logs);
};
exports.logErrorToConsole = (...logs) => {
    if (!logs || process.env.NODE_ENV !== 'development')
        return;
    console.error(...logs);
};
exports.logWarningToConsole = (...logs) => {
    if (!logs || process.env.NODE_ENV !== 'development')
        return;
    console.warn(...logs);
};
//# sourceMappingURL=utils.js.map