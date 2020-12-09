module.exports = {
	extends: [
		'@sprylab/eslint-config',
	],
	parserOptions: {
		project: './tsconfig.json',
	},
	rules: {
		'prettier/prettier': 'off',
		indent: [
			2,
			'tab',
			{'SwitchCase': 1}
		],
		'linebreak-style': [
			'error',
			'unix',
		],
		quotes: [
			'error',
			'single',
		],
		semi: [
			'error',
			'never',
		],
		'no-tabs': [
			'error',
			{ allowIndentationTabs: true }
		],
		// 'max-len': ['error', { 'code': 96 }]
	},
}
