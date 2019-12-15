const merge = require('webpack-merge')
const paths = require('./paths')

function sassLoader (options = {}) {
  return {
    loader: 'sass-loader',
    options: merge({
      sourceMap: true
    }, options)
  }
}

function postcssLoader (options = {}) {
  return {
    loader: 'postcss-loader',
    options: merge({
      sourceMap: true
    }, options)
  }
}

function cssLoader (options = {}) {
  return {
    loader: 'css-loader',
    options: merge({
      importLoaders: 3,
      localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
      sourceMap: true
    }, options)
  }
}

function cssLoaderLocals (options = {}) {
  return {
    loader: 'css-loader/locals',
    options: merge({
      importLoaders: 3,
      localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
      sourceMap: true
    }, options)
  }
}

function fileLoader (options = {}) {
  return {
    loader: 'file-loader',
    options: merge({
      name: '[path][name].[ext]',
      context: paths.PATH_SRC
    }, options)
  }
}

function styleLoader (options = {}) {
  return {
    loader: 'style-loader',
    options: merge({}, options)
  }
}

function htmlLoader (options) {
  return {
    loader: 'html-loader',
    options: merge({
      minimize: true
    }, options)
  }
}

function imageWebpackLoader (options = {}) {
  return {
    loader: 'image-webpack-loader',
    options: {
      mozjpeg: {
        progressive: true,
        quality: 65
      },
      optipng: {
        enabled: false
      },
      pngquant: {
        quality: [0.65, 0.90],
        speed: 4
      },
      gifsicle: {
        interlaced: false
      },
      webp: {
        quality: 75
      }
    }
  }
}

module.exports = {
  sassLoader,
  postcssLoader,
  cssLoader,
  cssLoaderLocals,
  fileLoader,
  styleLoader,
  htmlLoader,
  imageWebpackLoader
}
