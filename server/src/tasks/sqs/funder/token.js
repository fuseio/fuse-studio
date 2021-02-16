const mongoose = require('mongoose')
const { createNetwork } = require('@utils/web3')
const { get } = require('lodash')
const { transfer } = require('@utils/token')
const QueueJob = mongoose.model('QueueJob')
const Community = mongoose.model('Community')
const { fetchToken, adjustDecimals } = require('@utils/token')

const fundToken = async (account, { phoneNumber, receiverAddress, identifier, tokenAddress, communityAddress, bonusType }, job) => {
  const network = createNetwork('home', account)
  const community = await Community.findOne({ communityAddress })
  const bonusAmount = get(community, `plugins.${bonusType}Bonus.${bonusType}Info.amount`)
  const { decimals, symbol, name } = await fetchToken(tokenAddress)
  if (!bonusAmount) {
    throw Error(`No bonus of type ${bonusType} defined for community ${communityAddress}.`)
  }

  if (!identifier) {
    throw Error(`No identifier defined. [phoneNumber: ${phoneNumber}, receiverAddress: ${receiverAddress}, tokenAddress: ${tokenAddress}, communityAddress: ${communityAddress}, bonusType: ${bonusType}]`)
  }

  const tokenFundingMaxTimes = get(community, `${bonusType}.maxTimes`, 100)

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

  if (fundingsCountForPhoneNumber >= tokenFundingMaxTimes) {
    throw Error(`Join bonus reached maximum times ${tokenFundingMaxTimes}. [phoneNumber: ${phoneNumber}, receiverAddress: ${receiverAddress}, tokenAddress: ${tokenAddress}, communityAddress: ${communityAddress}, bonusType: ${bonusType}]`)
  }
  const amount = adjustDecimals(bonusAmount, 0, decimals)
  const receipt = await transfer(network, { from: account.address, to: receiverAddress, tokenAddress, amount }, { job, communityAddress })
  job.set('data.transactionBody', {
    ...get(job.data, 'transactionBody', {}),
    blockNumber: get(receipt, 'blockNumber'),
    value: amount,
    from: account.address,
    to: receiverAddress,
    tokenName: name,
    tokenDecimal: decimals,
    tokenSymbol: symbol,
    tokenAddress
  })
  job.save()
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
