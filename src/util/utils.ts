export const logToConsole = (log1: unknown, log2?: unknown, log3?: unknown): void | false => {
	if (process.env.NODE_ENV !== 'development') return
	if (!log1) return false

	log3
		? console.log(log1, log2, log3)
		: log2
			? console.log(log1, log2)
			: console.log(log1)
	
}

export const logErrorToConsole = (log1: unknown, log2?: unknown, log3?: unknown): void | false => {
	if (process.env.NODE_ENV !== 'development') return
	if (!log1) return false

	log3
		? console.error(log1, log2, log3)
		: log2
			? console.error(log1, log2)
			: console.error(log1)
	
}