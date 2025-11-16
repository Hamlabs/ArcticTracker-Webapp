const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    // Main application bundle - combines all source files in the correct order
    'arcticsetup-min': [
      './src/secUtils.js',
      './src/widget.js',
      './src/server.js',
      './src/uiSupport.js',
      './src/keysetup.js',
      './src/statusInfo.js',
      './src/wifisetup.js',
      './src/aprssetup.js',
      './src/digisetup.js',
      './src/trklogsetup.js'
    ],
    // CSS bundle
    'style/style-min': [
      './style/widget.css',
      './style/style.css',
      './style/mobil.css'
    ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname),
    clean: false // Don't clean the output directory to preserve other files
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    // Copy library files (they are already minified)
    new CopyPlugin({
      patterns: [
        { from: 'lib', to: 'lib' },
        { from: 'img', to: 'img' }
      ]
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false
          }
        },
        extractComments: false
      }),
      new CssMinimizerPlugin()
    ]
  },
  // Suppress warnings about missing dependencies
  resolve: {
    fallback: {
      "fs": false,
      "path": false
    }
  }
};
