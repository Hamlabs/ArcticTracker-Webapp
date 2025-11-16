const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require('fs');

// Custom plugin to concatenate JS files without module wrapping
class ConcatJSPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('ConcatJSPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'ConcatJSPlugin',
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        () => {
          // Read and concatenate source files in order
          const files = [
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
          ];
          
          let concatenated = files.map(file => {
            return fs.readFileSync(path.resolve(__dirname, file), 'utf8');
          }).join('\n');
          
          // Create the output asset
          compilation.emitAsset(
            'arcticsetup-min.js',
            new compiler.webpack.sources.RawSource(concatenated)
          );
          
          // Remove the automatically generated entry file if it exists
          if (compilation.assets['arcticsetup-min-entry.js']) {
            delete compilation.assets['arcticsetup-min-entry.js'];
          }
        }
      );
    });
  }
}

module.exports = {
  mode: 'production',
  entry: {
    // CSS bundle only
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
    new ConcatJSPlugin(),
    // Copy image files only
    new CopyPlugin({
      patterns: [
        { from: 'img', to: 'img' }
      ]
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /arcticsetup-min\.js$/,
        terserOptions: {
          format: {
            comments: false
          }
        },
        extractComments: false
      }),
      new CssMinimizerPlugin()
    ]
  }
};

