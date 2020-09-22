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
  console.log(`[makeDeposit] walletAddress: ${walletAddress}, customerAddress: ${customerAddress}, communityAddress: ${communityAddress}, tokenAddress: ${tokenAddress}, amount: ${amount}`)
  const community = await Community.findOne({ communityAddress })
  if (!community) {
    console.error(`[makeDeposit] could not find community ${communityAddress}`)
    return
  }
  const { foreignBridgeAddress, foreignTokenAddress, homeTokenAddress, isMultiBridge } = community
  console.log(`[makeDeposit] foreignBridgeAddress: ${foreignBridgeAddress}, foreignTokenAddress: ${foreignTokenAddress}, homeTokenAddress: ${homeTokenAddress}`)

  await new Deposit(deposit).save()
  console.log(`[makeDeposit] after save()`)

  if (communityAddress === config.get('daipCommunityAddress')) {
    console.log(`[makeDeposit] is DAIp community`)
    agenda.now('getDAIPointsToAddress', { from: walletAddress, tokenAddress: foreignTokenAddress, amount, recipient: customerAddress, bridgeType: 'foreign' })
  } else {
    if (isMultiBridge) {
      console.log(`[makeDeposit] transferring to home with relayTokens`)
      const transferToHome = await new Transfer({
        from: walletAddress,
        to: config.get('network.foreign.addresses.MultiBridgeMediator'),
        customerAddress,
        tokenAddress,
        amount,
        bridgeType: 'foreign',
        status: 'READY'
      }).save()
      agenda.now('relayTokens', { transferId: transferToHome._id })
    } else {
      console.log(`[makeDeposit] is not DAIp community`)
      const transferToHome = await new Transfer({
        from: walletAddress,
        to: foreignBridgeAddress,
        tokenAddress,
        amount,
        bridgeType: 'foreign',
        status: 'READY'
      }).save()
      console.log(`[makeDeposit] after transferToHome save()`)

      await new Transfer({
        from: walletAddress,
        to: customerAddress,
        tokenAddress: homeTokenAddress,
        amount,
        bridgeType: 'home',
        status: 'WAITING'
      }).save()
      console.log(`[makeDeposit] after transferToCustomer save()`)

      agenda.now('transfer', { transferId: transferToHome._id })
    }
  }
}

module.exports = {
  makeDeposit
}
