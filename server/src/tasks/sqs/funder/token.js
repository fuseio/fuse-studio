const config = require('config')
const mongoose = require('mongoose')
const { createNetwork } = require('@utils/web3')
const { transfer } = require('@utils/token')
const QueueJob = mongoose.model('QueueJob')
const { fetchToken, adjustDecimals } = require('@utils/token')

const fundToken = async (account, { phoneNumber, receiverAddress, identifier, tokenAddress, communityAddress, bonusType, bonusMaxTimesLimit, bonusAmount }, job) => {
  const network = createNetwork('home', account)
  const { decimals } = await fetchToken(tokenAddress)
  if (!bonusAmount) {
    throw Error(`No bonus of type ${bonusType} defined for community ${communityAddress}.`)
  }

  if (!identifier) {
    throw Error(`No identifier defined. [phoneNumber: ${phoneNumber}, receiverAddress: ${receiverAddress}, tokenAddress: ${tokenAddress}, communityAddress: ${communityAddress}, bonusType: ${bonusType}]`)
  }

  const fundingsCountForPhoneNumber = await QueueJob.find({
    name: 'fundToken',
    status: { $ne: 'failed' },
    _id: { $ne: job._id },
    'data.phoneNumber': phoneNumber,
    'data.tokenAddress': tokenAddress,
    'data.communityAddress': communityAddress,
    'data.receiverAddress': receiverAddress,
    'data.bonusType': bonusType
  }).countDocuments()

  if (fundingsCountForPhoneNumber >= bonusMaxTimesLimit) {
    throw Error(`Join bonus reached maximum times ${bonusMaxTimesLimit}. [phoneNumber: ${phoneNumber}, receiverAddress: ${receiverAddress}, tokenAddress: ${tokenAddress}, communityAddress: ${communityAddress}, bonusType: ${bonusType}]`)
  }

  const receipt = await transfer(network, { from: account.address, to: receiverAddress, tokenAddress, amount: adjustDecimals(bonusAmount, 0, decimals) }, { job, communityAddress })
  if (receipt.status) {
    console.log(`succesfully funded ${receiverAddress} with ${bonusAmount} of token ${tokenAddress}`)
  } else {
    console.warn(`error in funding ${receiverAddress} with ${bonusAmount} of token ${tokenAddress}`)
    console.log({ receipt })
  }
}

module.exports = {
  fundToken
}
