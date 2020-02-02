const crypto = require('crypto')

const sign = (data) => crypto
  .createHmac('sha256', 'sk_test_nLyqeKTgttHowWaXYqbmO0753JuH8hS')
  .update(data)
  .digest('base64')

module.exports = {
  sign
}
