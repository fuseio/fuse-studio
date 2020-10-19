const config = require('config')
const mongoose = require('mongoose')
const { lockAccount, withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const { toWei, toChecksumAddress } = require('web3-utils')
const EthFunding = mongoose.model('EthFunding')

const setFunded = async (id) => EthFunding.findByIdAndUpdate(id, { funded: true })

const ethFunder = withAccount(async (account, { accountAddress }, job) => {
  const ethFunding = await new EthFunding({
    accountAddress: toChecksumAddress(accountAddress),
    fundingDate: new Date()
  }).save()
  const bonus = config.get('bonus.eth.ropsten').toString()
  const network = createNetwork('foreign', account)
  const { web3, networkType } = network
  if (networkType !== 'ropsten') {
    throw Error('Fund ETH available only for ropsten')
  }
  web3.eth.transactionConfirmationBlocks = parseInt(config.get(`network.foreign.contract.options.transactionConfirmationBlocks`))
  const receipt = await web3.eth.sendTransaction({
    to: accountAddress,
    from: account.address,
    value: toWei(bonus),
    nonce: account.nonces['foreign'],
    gasPrice: '1000000000',
    gas: config.get('gasLimitForTx.funder')
  }).on('transactionHash', (hash) => {
    job.attrs.data.txHash = hash
    job.save()
  })
  if (receipt) {
    job.attrs.data.receipt = true
    account.nonces['foreign']++
    await setFunded(ethFunding._id)
    await account.save()
    job.save()
  }
}, (args) => {
  return lockAccount({ role: 'eth' })
})

module.exports = {
  ethFunder
}
