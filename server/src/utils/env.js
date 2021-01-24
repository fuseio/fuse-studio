const config = require('config')

const isProduction = () => config.get('env') === 'production'

module.exports = {
  isProduction
}
