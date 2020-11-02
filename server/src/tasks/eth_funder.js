const config = require('config')
const mongoose = require('mongoose')
const { lockAccount, withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const { toWei, toChecksumAddress } = require('web3-utils')
const EthFunding = mongoose.model('EthFunding')

const setFunded = async (id) => EthFunding.findByIdAndUpdate(id, { funded: true })

const ethFunder = withAccount(async (account, { accountAddress, networkName }, job) => {
  const bridgeType = networkName === 'fuse' ? 'home' : 'foreign'
  const network = createNetwork(bridgeType, account)
  const { web3, networkType } = network
  if (networkType === 'fuse' || networkType === 'ropsten') {
    const ethFunding = await new EthFunding({
      accountAddress: toChecksumAddress(accountAddress),
      fundingDate: new Date(),
      network: networkType
    }).save()
    web3.eth.transactionConfirmationBlocks = parseInt(config.get(`network.foreign.contract.options.transactionConfirmationBlocks`))
    const bonus = networkName
      ? config.get('bonus.trade.fuse').toString()
      : config.get('bonus.eth.ropsten').toString()
    const receipt = await web3.eth.sendTransaction({
      to: accountAddress,
      from: account.address,
      value: toWei(bonus),
      nonce: account.nonces[bridgeType],
      gasPrice: '1000000000',
      gas: config.get('gasLimitForTx.funder')
    }).on('transactionHash', (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    })
    if (receipt) {
      job.attrs.data.receipt = true
      account.nonces[bridgeType]++
      await setFunded(ethFunding._id)
      await account.save()
      job.save()
    }
  } else {
    throw Error(`Fund available only for ${networkName || 'ropsten'}`)
  }
}, ({ networkName }) => {
  const bridgeType = networkName === 'fuse' ? 'home' : 'foreign'
  return lockAccount({ role: 'eth', bridgeType })
})

module.exports = {
  ethFunder
}
