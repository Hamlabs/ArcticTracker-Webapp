const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'arcticsetup-min.js',
    path: path.resolve(__dirname, '.'),
    iife: false,
  },
  optimization: {
    minimize: true,
  },
  performance: {
    hints: false,
  },
};
