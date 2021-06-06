const config = require('config')
const mongoose = require('mongoose')
const { createNetwork } = require('@utils/web3')
const { get } = require('lodash')
const { transfer } = require('@utils/token')
const QueueJob = mongoose.model('QueueJob')
const Community = mongoose.model('Community')
const { fetchToken, adjustDecimals } = require('@utils/token')
const { toWei } = require('web3-utils')

const calcDepositReward = (amountDeposited) => {

}

const fundToken = async (account, { phoneNumber, receiverAddress, identifier, tokenAddress, communityAddress, bonusType }, job) => {
  const network = createNetwork('home', account)
  const community = await Community.findOne({ communityAddress })
  const bonusAmount = get(community, `plugins.${bonusType}Bonus.${bonusType}Info.amount`)
  const { decimals } = await fetchToken(tokenAddress)
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

  const receipt = await transfer(network, { from: account.address, to: receiverAddress, tokenAddress, amount: adjustDecimals(bonusAmount, 0, decimals) }, { job, communityAddress })
  if (receipt.status) {
    console.log(`succesfully funded ${receiverAddress} with ${bonusAmount} of token ${tokenAddress}`)
  } else {
    console.warn(`error in funding ${receiverAddress} with ${bonusAmount} of token ${tokenAddress}`)
    console.log({ receipt })
  }
}

const rewardDeposit = async (account, { phoneNumber, receiverAddress, identifier }, job) => {
  const network = createNetwork('home', account)
  const bonusAmount = '50'
  const tokenAddress = '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629'
  const bonusType = 'topup'
  if (!identifier) {
    throw Error(`No identifier defined. [phoneNumber: ${phoneNumber}, receiverAddress: ${receiverAddress}, tokenAddress: ${tokenAddress}, communityAddress: ${communityAddress}, bonusType: ${bonusType}]`)
  }

  const tokenFundingMaxTimes = 1

  const fundingsCountForPhoneNumber = await QueueJob.find({
    name: 'rewardDeposit',
    // status: { $ne: 'failed' },
    _id: { $ne: job._id },
    'data.phoneNumber': phoneNumber,
    'data.tokenAddress': tokenAddress,
    'data.receiverAddress': receiverAddress,
    'data.bonusType': bonusType
  }).countDocuments()

  if (fundingsCountForPhoneNumber >= 1) {
    throw Error(`Join bonus reached maximum times ${tokenFundingMaxTimes}. [phoneNumber: ${phoneNumber}, receiverAddress: ${receiverAddress}, tokenAddress: ${tokenAddress}, bonusType: ${bonusType}]`)
  }

  const receipt = await transfer(network, { from: account.address, to: receiverAddress, tokenAddress, amount: adjustDecimals(bonusAmount, 0, 18) }, { job })
  if (receipt.status) {
    console.log(`succesfully funded ${receiverAddress} with ${bonusAmount} of token ${tokenAddress}`)
  } else {
    console.warn(`error in funding ${receiverAddress} with ${bonusAmount} of token ${tokenAddress}`)
    console.log({ receipt })
  }
}

module.exports = {
  fundToken,
  rewardDeposit
}
