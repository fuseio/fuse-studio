const config = require('config')

const isProduction = () => config.get('env') === 'production'

const isDevelopment = () => config.get('env') === 'dev'

module.exports = {
  isProduction,
  isDevelopment
}
