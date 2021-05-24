const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

const webpack = require('webpack')
const config = require('config')

module.exports = {
  entry: ['react-hot-loader/patch', './src'],
  output: {
    filename: '[name].[hash].js',
    publicPath: '/'
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'assets'),
      'node_modules'
    ],
    alias: {
      'react-dom': '@hot-loader/react-dom'
    },
    extensions: ['.mjs', '.js', '.jsx', '.json', '.scss']
  },
  devServer: {
    port: process.env.COMMUNITY_COLU_PORT || 9000,
    historyApiFallback: true,
    hot: true,
    allowedHosts: [
      '.ngrok.io'
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({ CONFIG: JSON.stringify(config) }),
    new ProgressBarPlugin(),
    new HtmlWebPackPlugin({
      appMountId: 'app',
      template: process.env.NODE_ENV === 'development' ? './src/index.dev.html' : './src/index.html',
      filename: './index.html'
    }),
    new FaviconsWebpackPlugin({
      logo: path.join(path.resolve(__dirname, './'), '/assets/images/favicon.png'),
      prefix: 'images/favicons/',
      favicons: {
        appName: 'Fuse Studio',
        appDescription: 'An open source operating system for communities',
        developerName: null,
        developerURL: null,
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: false,
          coast: false,
          favicons: true,
          firefox: false,
          windows: false,
          yandex: false
        }
      }
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          process.env.NODE_ENV === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif|jpeg)$/,
        use: {
          loader: 'file-loader'
        }
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'file-loader']
      }
    ]
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
}
