const BigNumber = require('bignumber.js')
const mongoose = require('mongoose')
const Transfer = mongoose.model('Transfer')
const { lockAccount, withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const { getNetwork } = require('@services/web3')
const utils = require('@utils/token')
const { handleReceipt } = require('@handlers/receipts')

const transfer = withAccount(async (account, { transferId }) => {
  const transferDoc = await Transfer.findById(transferId)
  if (!transferDoc || transferDoc.status !== 'READY') {
    return
  }

  try {
    const network = createNetwork(transferDoc.bridgeType, account)

    const receipt = await utils.transfer(network, transferDoc.toObject())
    await handleReceipt(receipt)

    transferDoc.status = 'DONE'
    await transferDoc.save()
  } catch (e) {
    transferDoc.status = 'FAILED'
    await transferDoc.save()
    throw e
  }
}, async (transferId) => {
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

const startTransfers = async () => {
  const { agenda } = require('@services/agenda')
  const transfers = await Transfer.find({ status: 'WAITING' })
  for (let transferDoc of transfers) {
    const network = getNetwork(transferDoc)
    const balance = await utils.fetchBalance(network, transferDoc.tokenAddress, transferDoc.from)
    if (new BigNumber(balance).isGreaterThanOrEqualTo(transferDoc.amount.toString())) {
      transferDoc.status = 'READY'
      await transferDoc.save()
      agenda.now('transfer', { transferId: transferDoc._id })
    }
  }
}

module.exports = {
  startTransfers,
  transfer
}
