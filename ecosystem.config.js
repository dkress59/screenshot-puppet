module.exports = {
	apps: [{
		name: 'puppet',
		script: 'yarn',
		args: 'start',
		watch: 'dist',
		interpreter: '/bin/bash',
		env_production: {
			'PUPPET_ACCESS': '*',
			'PUPPET_PORT': 4848,
			'DK20_PORT': 5959,
			'PUPPET_URL': 'http://192.168.0.59:4848',
			'DK20_URL': 'http://192.168.0.59:5959',
		}
	}]
}
