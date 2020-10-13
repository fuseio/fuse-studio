const config = require('config')
const mongoose = require('mongoose')
const { lockAccount, withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const { toWei, toChecksumAddress } = require('web3-utils')
const EthFunding = mongoose.model('EthFunding')

const updateEthFunding = async (id) => EthFunding.findByIdAndUpdate(id, { funded: true })

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
  const promise = web3.eth.sendTransaction({
    to: accountAddress,
    from: account.address,
    value: toWei(bonus),
    nonce: account.nonce,
    gasPrice: '1000000000',
    gas: config.get('gasLimitForTx.funder')
  }).on('transactionHash', (hash) => {
    job.attrs.data.txHash = hash
    job.save()
  }).on('receipt', (receipt) => {
    job.attrs.data.receipt = receipt
    job.save()
  })

  await promise
  await updateEthFunding(ethFunding._id)
}, (args) => {
  return lockAccount({ role: 'eth' })
})

module.exports = {
  ethFunder
}
