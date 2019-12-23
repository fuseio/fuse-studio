const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
// const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')

const webpack = require('webpack')
const config = require('config')

const loaders = require('./tools/loaders')
const paths = require('./tools/paths')

const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
  entry: [
    '@babel/polyfill',
    'react-hot-loader/patch',
    './src/index.js'
  ],
  output: {
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'assets'),
      'node_modules'
    ],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  },
  devServer: {
    port: process.env.COMMUNITY_COLU_PORT || 9000,
    historyApiFallback: true,
    allowedHosts: [
      '.ngrok.io'
    ]
  },
  plugins: [
    // new DuplicatePackageCheckerPlugin(),
    new ProgressBarPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html'
    }),
    new webpack.DefinePlugin({ CONFIG: JSON.stringify(config) }),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  performance: {
    hints: devMode ? 'warning' : false
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        include: [path.resolve(paths.PATH_SRC, 'scss', 'main.scss')],
        use: [loaders.miniCssExtractPluginLoader({ hmr: devMode }), loaders.cssLoader(), loaders.postcssLoader(), loaders.sassLoader()]
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg|webp|ico)$/,
        use: [loaders.fileLoader(), loaders.imageWebpackLoader()]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [loaders.urlLoader()]
      },
      {
        test: /\.html$/,
        use: [loaders.htmlLoader()]
      }
    ]
  }
}
