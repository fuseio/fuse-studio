const config = require('config')
const mongoose = require('mongoose')
const { lockAccount, withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const { toWei, toChecksumAddress } = require('web3-utils')
const EthFunding = mongoose.model('EthFunding')

const setFunded = async id => EthFunding.findByIdAndUpdate(id, { funded: true })

const ethFunder2 = withAccount(
  async (account, { accountAddress, networkName }, job) => {
    if (networkName !== 'fuse' && networkName !== 'ropsten') {
      throw Error(`Fund available only for ${networkName}`)
    }

    const bridgeType = networkName === 'fuse' ? 'home' : 'foreign'
    const { send, networkType } = createNetwork(bridgeType, account)
    const ethFunding = await new EthFunding({
      accountAddress: toChecksumAddress(accountAddress),
      fundingDate: new Date(),
      network: networkType
    }).save()

    const bonus = bridgeType === 'home'
      ? config.get('bonus.trade.fuse').toString()
      : config.get('bonus.eth.ropsten').toString()
    const receipt = await send({
      to: accountAddress,
      from: account.address,
      value: toWei(bonus),
      nonce: account.nonces[bridgeType],
      gasPrice: '1000000000',
      gas: config.get('gasLimitForTx.funder')
    }, {
      transactionHash: (hash) => {
        job.attrs.data.txHash = hash
        job.save()
      }
    })
    if (receipt) {
      await setFunded(ethFunding._id)
    }
  },
  ({ networkName }) => {
    const bridgeType = networkName === 'fuse' ? 'home' : 'foreign'
    return lockAccount({ role: 'eth', bridgeType })
  }
)

module.exports = {
  ethFunder
}
