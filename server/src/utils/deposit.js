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
  const { foreignBridgeAddress, homeTokenAddress } = await Community.findOne({ communityAddress })

  await new Deposit(deposit).save()

  if (communityAddress === config.get('daipCommunityAddress')) {
    // TODO special flow
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
