export const logToConsole = (...logs: unknown[]): void | false => {
	if (!logs || process.env.NODE_ENV !== 'development') return

	console.log(...logs)
}

export const logErrorToConsole = (...logs: unknown[]): void | false => {
	if (!logs || process.env.NODE_ENV !== 'development') return

	console.error(...logs)
}