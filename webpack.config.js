const path = require('path')
const Webpack = require('webpack')
const WebpackMd5Hash = require('webpack-md5-hash')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')

const dirname = path.resolve(__dirname)

module.exports = (env, argv) => ({
  context: dirname,
  entry: {
    'flownote.min': './src/index.js'
  },
  devtool: argv.mode === 'production' ? false : 'source-map',
  output: {
    path: dirname + '/dist',
    chunkFilename: 'chunks/[name].js',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new Webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new WebpackMd5Hash(),
    new CopyWebpackPlugin([
      { from: 'browser.html', to: 'index.html' }
    ]),
    new CompressionPlugin({
      algorithm: 'gzip'
    })
  ],
  devServer: {
    contentBase: dirname + '/dist',
    watchContentBase: true,
    port: 1000
  }
})
