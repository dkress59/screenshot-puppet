module.exports = {
	collectCoverageFrom: ['src/**/*.(js|jsx|ts|tsx)'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	moduleNameMapper: {
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
					'<rootDir>/__mocks__/fileMock.js',
		'\\.(css|less)$': 'identity-obj-proxy',
	},
	globals: {
		'ts-jest': {
			babelConfig: true,
		},
	},
	cacheDirectory: '.jest/cache',
	transformIgnorePatterns: ['node_modules/(?!frontend-shared-code)'],
	testRegex: '(/test/.*|(\\.|/)(test|spec))\\.tsx?$',
}