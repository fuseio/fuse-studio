const config = require('config')
const mongoose = require('mongoose')
const { lockAccount, withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const { toWei, toChecksumAddress } = require('web3-utils')
const EthFunding = mongoose.model('EthFunding')

const ethFunder = withAccount(async (account, { accountAddress }) => {
  try {
    new EthFunding({
      accountAddress: toChecksumAddress(accountAddress),
      fundingDate: new Date()
    }).save()
    const bonus = config.get('bonus.eth.ropsten').toString()
    const network = createNetwork('foreign', account)
    const { web3 } = network
    await web3.eth.sendTransaction({
      to: accountAddress,
      from: account.address,
      value: toWei(bonus),
      nonce: account.nonce
    })
  } catch (e) {
    throw e
  }
}, (args) => {
  return lockAccount({ role: 'eth' })
})

module.exports = {
  ethFunder
}
