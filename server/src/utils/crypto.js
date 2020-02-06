const crypto = require('crypto')

const sign = (data, key) => crypto
  .createHmac('sha256', key)
  .update(data)
  .digest('base64')

module.exports = {
  sign
}
