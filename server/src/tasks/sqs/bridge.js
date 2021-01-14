const mongoose = require('mongoose')
const ActionOnRelay = mongoose.model('ActionOnRelay')
const { createNetwork } = require('@utils/web3')
const utils = require('@utils/token')
const bridgeUtils = require('@utils/bridge')
const BigNumber = require('bignumber.js')
const MintableBurnableTokenAbi = require('@fuse/token-factory-contracts/abi/MintableBurnableToken')

const relayTokens = async (account, { accountAddress, bridgeType, bridgeAddress, tokenAddress, receiver, amount }) => {
  const network = createNetwork(bridgeType, account)
  const allowance = await utils.getAllowance(network, { tokenAddress, owner: accountAddress, spender: bridgeAddress })
  const hasAllowance = new BigNumber(allowance).isGreaterThanOrEqualTo(amount.toString())
  if (!hasAllowance) {
    const approveReceipt = await utils.approve(network, { from: accountAddress, tokenAddress, spender: bridgeAddress, infinite: true })
    if (!approveReceipt.status) {
      console.error(`Approving failed with receipt: ${JSON.stringify(approveReceipt)} `)
    }
  }
  const relayTokensReceipt = await bridgeUtils.relayTokens(network, { from: accountAddress, bridgeAddress, tokenAddress, receiver, amount })
  if (!relayTokensReceipt.status) {
    throw new Error(`Relaying failed with receipt: ${JSON.stringify(relayTokensReceipt)} `)
  }
  return relayTokensReceipt
}

const mintOnRelay = async (account, { actionOnRelayId, bridgeType, tokenAddress, amount, mintTo }, job) => {
  const actionOnRelay = await ActionOnRelay.findById(actionOnRelayId)
  if (!actionOnRelay) {
    console.error(`action with ${actionOnRelayId} id not found or lare`)
    return
  }

  if (actionOnRelay.status !== 'READY') {
    console.error(`action with ${actionOnRelayId} id got wrong action status ${actionOnRelay.status}`)
    return
  }

  try {
    const { createContract, createMethod, send } = createNetwork(bridgeType, account)
    const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)
    const method = createMethod(tokenContractInstance, 'mint', mintTo, amount)

    const receipt = await send(method, {
      from: account.address
    }, {
      transactionHash: (hash) => {
        console.log(`transaction ${hash} is created by ${account.address}`)
        job.set('data.txHash', hash)
        job.save()
      }
    })

    if (receipt.status) {
      actionOnRelay.status = 'DONE'
    } else {
      actionOnRelay.status = 'FAILED'
    }
    await actionOnRelay.save()
  } catch (e) {
    actionOnRelay.status = 'FAILED'
    await actionOnRelay.save()
    throw e
  }
}

module.exports = {
  relayTokens,
  mintOnRelay
}
