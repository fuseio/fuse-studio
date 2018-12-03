const processPastEvents = require('./utils').processPastEvents
const ColuLocalCurrencyAbi = require('@constants/abi/ColuLocalCurrency')
const mongoose = require('mongoose')

const Community = mongoose.model('Community')
const web3 = require('@services/web3')

const processPastTransferEvents = async () => {
  const communitites = await Community.find()

  const processes = communitites.map(community => {
    const address = community.ccAddress
    const ColuLocalCurrencyContract = new web3.eth.Contract(ColuLocalCurrencyAbi, address)
    return processPastEvents('Transfer', ColuLocalCurrencyContract, {conditions: {address}})
  })
  return Promise.all(processes)
}

module.exports = {
  processPastTransferEvents
}
