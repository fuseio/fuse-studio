const mongoose = require('mongoose')
const Transfer = mongoose.model('Transfer')
const { lockAccount, withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const utils = require('@utils/token')
const bridgeUtils = require('@utils/bridge')
const { handleReceipt } = require('@handlers/receipts')

const relayTokens = withAccount(async (account, { transferId }) => {
  const transferDoc = await Transfer.findById(transferId)
  if (!transferDoc || transferDoc.status !== 'READY') {
    return
  }
  try {
    const network = createNetwork(transferDoc.bridgeType, account)
    const hasAllowance = await utils.hasAllowance(network, transferDoc.toObject())
    if (!hasAllowance) {
      const approveReceipt = await utils.approve(network, transferDoc.toObject())
      await handleReceipt(approveReceipt)
    }
    const relayTokensReceipt = await bridgeUtils.relayTokens(network, transferDoc.toObject())
    await handleReceipt(relayTokensReceipt)
    transferDoc.status = 'DONE'
    await transferDoc.save()
  } catch (e) {
    transferDoc.status = 'FAILED'
    await transferDoc.save()
    throw e
  }
}, async ({ transferId }) => {
  const transferDoc = await Transfer.findById(transferId)
  if (!transferDoc || transferDoc.status !== 'READY') {
    return
  }

  const account = await lockAccount({ address: transferDoc.from })
  if (!account) {
    transferDoc.status = 'WAITING'
    await transferDoc.save()
  }
  return account
})

module.exports = {
  relayTokens
}
