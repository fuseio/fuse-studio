const mongoose = require('mongoose')
const { agenda } = require('@services/agenda')
const Transfer = mongoose.model('Transfer')
const Community = mongoose.model('Community')

const makeDeposit = async ({
  walletAddress,
  customerAddress,
  foreignTokenAddress,
  amount
}) => {
  const { foreignBridgeAddress, homeTokenAddress } = await Community.findOne({ foreignTokenAddress })
  const transferToHome = await new Transfer({
    from: walletAddress,
    to: foreignBridgeAddress,
    tokenAddress: foreignTokenAddress,
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

module.exports = {
  makeDeposit
}
