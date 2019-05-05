const config = require('config')
const { createWeb3, send } = require('@utils/web3')

const { from, web3 } = createWeb3(config.get('web3.provider'))

module.exports = {
  from,
  web3,
  send: send.bind(null, web3, 'foreign')
}
