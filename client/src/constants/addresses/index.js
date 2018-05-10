
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./addresses.prod')
} else {
  module.exports = require('./addresses.dev')
}
