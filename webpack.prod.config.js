const path = require('path');

module.exports = {
  mode: 'production',

  entry: path.resolve(__dirname, 'src/index.js'),

  output: {
    filename: 'index.min.js',
    library: 'ibm-video-streaming-player-api',
    libraryTarget: 'umd',
  },

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
