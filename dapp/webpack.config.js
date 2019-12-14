const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const webpack = require('webpack')
const config = require('config')

const loaders = require('./tools/loaders')
const paths = require('./tools/paths')

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
    new FriendlyErrorsWebpackPlugin(),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html'
    }),
    new webpack.DefinePlugin({ CONFIG: JSON.stringify(config) }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[name].[hash].chunk.css'
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [loaders.styleLoader(), loaders.cssLoader(), loaders.postcssLoader()]
      },
      {
        test: /\.(scss|sass)$/,
        include: [path.resolve(paths.PATH_SRC, 'scss', 'main.scss')],
        use: [MiniCssExtractPlugin.loader, loaders.cssLoader(), loaders.postcssLoader(), loaders.sassLoader()]
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg|gif|png|jpg|jpeg|webp|ico)$/,
        use: [loaders.fileLoader()]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true }
          }
        ]
      }
    ]
  }
}
