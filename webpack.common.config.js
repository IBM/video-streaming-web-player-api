/* eslint-env node */
const path = require('path');

module.exports = {
	entry: path.resolve(__dirname, 'src/index.js'),

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: [/node_modules/],
				loader: 'babel-loader',
				options: { cacheDirectory: true },
			},
		],
	},
};
