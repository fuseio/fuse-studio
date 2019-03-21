const processPastEvents = require('./utils').processPastEvents
const basicTokenAbi = require('@constants/abi/BasicToken')
const mongoose = require('mongoose')

const Token = mongoose.model('Token')
const web3 = require('@services/web3')

const processPastTransferEvents = async () => {
  const tokens = await Token.find()

  const processes = tokens.map(token => {
    const {address} = token
    const basicTokenContract = new web3.eth.Contract(basicTokenAbi, address)
    return processPastEvents('Transfer', basicTokenContract, {conditions: {address}})
  })
  return Promise.all(processes)
}

module.exports = {
  processPastTransferEvents
}
