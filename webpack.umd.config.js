const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.config');

const developmentConfig = {
	mode: 'development',

	output: {
		filename: 'index.umd.js',
		library: 'ibmVideoStreamingPlayerAPI',
		libraryTarget: 'umd',
	},
};

const productionConfig = {
	mode: 'production',

	output: {
		filename: 'index.umd.min.js',
		library: 'ibmVideoStreamingPlayerAPI',
		libraryTarget: 'umd',
	},
};

module.exports = (env) => {
	switch (env) {
		case 'development':
			return merge(commonConfig, developmentConfig);
		case 'production':
			return merge(commonConfig, productionConfig);
		default:
			throw new Error('No matching configuration was found!');
	}
};
