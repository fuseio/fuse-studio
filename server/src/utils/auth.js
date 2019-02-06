const config = require('config')

const generateSignatureData = ({ accountAddress, date }) => {
  return { types: {
    EIP712Domain: [
      { name: 'name', type: 'string' }, { name: 'version', type: 'string' }, { name: 'chainId', type: 'uint256' }
    ],
    Person: [{ name: 'wallet', type: 'address' }],
    Login: [
      { name: 'account', type: 'string' },
      { name: 'date', type: 'string' },
      { name: 'content', type: 'string' }
    ]
  },
  primaryType: 'Login',
  domain: config.get('api.auth.domain'),
  message: { account: accountAddress, date, content: 'Login request' }
  }
}

module.exports = {
  generateSignatureData
}
