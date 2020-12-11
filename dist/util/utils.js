export const logToConsole = (...logs) => {
    if (!logs || process.env.NODE_ENV !== 'development')
        return;
    console.log(...logs);
};
export const logErrorToConsole = (...logs) => {
    if (!logs || process.env.NODE_ENV !== 'development')
        return;
    console.error(...logs);
};
export const logWarningToConsole = (...logs) => {
    if (!logs || process.env.NODE_ENV !== 'development')
        return;
    console.warn(...logs);
};
//# sourceMappingURL=utils.js.map