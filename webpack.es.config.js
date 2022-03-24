const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.config');

const developmentConfig = {
	mode: 'development',

	output: {
		filename: 'index.es.js',
		library: {
			type: 'module',
		},
	},

	experiments: {
		outputModule: true,
	},
};

const productionConfig = {
	mode: 'production',

	output: {
		filename: 'index.es.min.js',
		library: {
			type: 'module',
		},
	},

	experiments: {
		outputModule: true,
	},
};

module.exports = (env) => {
	switch (true) {
		case env.development:
			return merge(commonConfig, developmentConfig);
		case env.production:
			return merge(commonConfig, productionConfig);
		default:
			throw new Error('No matching configuration was found!');
	}
};
