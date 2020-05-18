const BigNumber = require('bignumber.js')
const mongoose = require('mongoose')
const Transfer = mongoose.model('Transfer')
const { lockAccount, withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const { getNetwork } = require('@services/web3')
const utils = require('@utils/token')
const { handleReceipt } = require('@handlers/receipts')
const { getAbi } = require('@constants/abi')

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

const getDAIPointsToAddress = withAccount(async (account, { bridgeType, tokenAddress, amount, recipient }, job) => {
  console.log(`[getDAIPointsToAddress] bridgeType: ${bridgeType}, tokenAddress: ${tokenAddress}, amount: ${amount}, recipient: ${recipient}`)
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const tokenContractInstance = createContract(getAbi('DAIPoints'), tokenAddress)

  const method = createMethod(tokenContractInstance, 'getDAIPointsToAddress', amount, recipient)

  await send(method, {
    from: account.address,
    gas: 1000000
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })
}, ({ from }) => {
  return lockAccount({ address: from })
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
  transfer,
  getDAIPointsToAddress
}
