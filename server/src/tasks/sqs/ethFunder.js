const config = require('config')
const mongoose = require('mongoose')
const { createNetwork } = require('@utils/web3')
const { toWei } = require('web3-utils')
const QueueJob = mongoose.model('QueueJob')

const ethFunder = async (account, { receiverAddress, networkName }, job) => {
  if (networkName !== 'fuse' && networkName !== 'ropsten') {
    throw Error(`the funder is not available on ${networkName}`)
  }

  const existingJob = await QueueJob.findOne({
    name: 'ethFunder',
    status: { $ne: 'failed' },
    _id: { $ne: job._id },
    'data.networkName': networkName,
    'data.receiverAddress': receiverAddress
  })

  if (existingJob) {
    const errorMsg = `account ${receiverAddress} already have a funding with status ${existingJob.status}, id: ${existingJob._id}`
    console.warn(errorMsg)
    return job.failAndUpdate(errorMsg)
  }

  const bridgeType = networkName === 'fuse' ? 'home' : 'foreign'
  const { send } = createNetwork(bridgeType, account)

  const bonus =
    bridgeType === 'home'
      ? config.get('bonus.trade.fuse').toString()
      : config.get('bonus.eth.ropsten').toString()
  const receipt = await send(null,
    {
      to: receiverAddress,
      from: account.address,
      value: toWei(bonus),
      gasPrice: '1000000000',
      gas: config.get('gasLimitForTx.funder')
    },
    {
      transactionHash: hash => {
        console.log(`transaction ${hash} is created by ${account.address}`)
        job.set('data.txHash', hash)
        job.save()
      }
    }
  )
  if (receipt.status) {
    console.log(`succesfully funder ${receiverAddress} with ${bonus} native`)
  } else {
    console.warn(`error in funding ${receiverAddress} with ${bonus} native`)
    console.log({ receipt })
  }
}

module.exports = {
  ethFunder
}
