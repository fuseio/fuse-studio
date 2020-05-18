const { BN } = web3.utils

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should()

exports.ERROR_MSG = 'VM Exception while processing transaction: revert'
exports.ERROR_MSG_OPCODE = 'VM Exception while processing transaction: invalid opcode'
exports.INVALID_ARGUMENTS = 'Invalid number of arguments to Solidity function'
exports.ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
exports.RANDOM_ADDRESS = '0xc0ffee254729296a45a3885639AC7E10F9d54979'