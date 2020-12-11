"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logWarningToConsole = exports.logErrorToConsole = exports.logToConsole = void 0;
const logToConsole = (...logs) => {
    if (!logs || process.env.NODE_ENV !== 'development')
        return;
    console.log(...logs);
};
exports.logToConsole = logToConsole;
const logErrorToConsole = (...logs) => {
    if (!logs || process.env.NODE_ENV !== 'development')
        return;
    console.error(...logs);
};
exports.logErrorToConsole = logErrorToConsole;
const logWarningToConsole = (...logs) => {
    if (!logs || process.env.NODE_ENV !== 'development')
        return;
    console.warn(...logs);
};
exports.logWarningToConsole = logWarningToConsole;
//# sourceMappingURL=utils.js.map