const mongoose = require('mongoose')
const { agenda } = require('@services/agenda')
const Deposit = mongoose.model('Deposit')
const Transfer = mongoose.model('Transfer')
const Community = mongoose.model('Community')
const config = require('config')

const makeDeposit = async (deposit) => {
  const {
    walletAddress,
    customerAddress,
    communityAddress,
    tokenAddress,
    amount
  } = deposit
  const { foreignBridgeAddress, foreignTokenAddress, homeTokenAddress } = await Community.findOne({ communityAddress })

  await new Deposit(deposit).save()

  if (communityAddress === config.get('daipCommunityAddress')) {
    agenda.now('getDAIPointsToAddress', { from: walletAddress, tokenAddress: foreignTokenAddress, amount, recipient: customerAddress, bridgeType: 'foreign' })
  } else {
    const transferToHome = await new Transfer({
      from: walletAddress,
      to: foreignBridgeAddress,
      tokenAddress,
      amount,
      bridgeType: 'foreign',
      status: 'READY'
    }).save()

    await new Transfer({
      from: walletAddress,
      to: customerAddress,
      tokenAddress: homeTokenAddress,
      amount,
      bridgeType: 'home',
      status: 'WAITING'
    }).save()

    agenda.now('transfer', { transferId: transferToHome._id })
  }
}

module.exports = {
  makeDeposit
}
