if (CONFIG.debugTrace) {
  module.exports = require('./configureStore.dev')
} else {
  module.exports = require('./configureStore.prod')
}
