const { merge } = require('webpack-merge');
const EsmWebpackPlugin = require('@purtuga/esm-webpack-plugin');
const commonConfig = require('./webpack.common.config');

const developmentConfig = {
  mode: 'development',

  output: {
    filename: 'index.es.js',
    library: 'ibmVideoStreamingPlayerAPI',
    libraryTarget: 'var',
  },

  plugins: [
    new EsmWebpackPlugin()
  ],
};

const productionConfig = {
  mode: 'production',

  output: {
    filename: 'index.es.min.js',
    library: 'ibmVideoStreamingPlayerAPI',
    libraryTarget: 'var',
  },

  plugins: [
    new EsmWebpackPlugin()
  ],
};

module.exports = env => {
  switch(env) {
    case 'development':
      return merge(commonConfig, developmentConfig);
    case 'production':
      return merge(commonConfig, productionConfig);
    default:
      throw new Error('No matching configuration was found!');
  }
}
