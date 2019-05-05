const Web3 = require('web3')
const config = require('config')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')

function add0xPrefix (str) {
  if (str.indexOf('0x') === 0) {
    return str
  }
  return `0x${str}`
}

const createWeb3 = (providerUrl) => {
  const web3 = new Web3(providerUrl)
  const account = web3.eth.accounts.wallet.add(add0xPrefix(config.get('secrets.fuse.bridge.privateKey')))
  return {from: account.address, web3}
}

const send = async (web3, bridgeType, method, options) => {
  const {from} = options
  const gas = await method.estimateGas({from})
  const account = await Account.findOneOrCreate({bridgeType, address: from})
  let receipt
  try {
    receipt = await method.send({...options, gas, nonce: account.nonce})
  } catch (error) {
    const nonce = await web3.eth.getTransactionCount(from)
    account.nonce = nonce
    receipt = await method.send({...options, gas, nonce: account.nonce})
  }
  account.nonce++
  await account.save()
  return receipt
}

module.exports = {
  createWeb3,
  send
}
