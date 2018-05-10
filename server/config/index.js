if (process.env.NODE_ENV === 'production') {
  module.exports = require('./index.prod')
} else if (process.env.NODE_ENV === 'qa') {
  module.exports = require('./index.qa')
} else {
  module.exports = require('./index.dev')
}
