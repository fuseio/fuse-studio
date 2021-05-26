const mongoose = require('mongoose')
const ActionOnRelay = mongoose.model('ActionOnRelay')
const Deposit = mongoose.model('Deposit')
const { createNetwork } = require('@utils/web3')
const utils = require('@utils/token')
const bridgeUtils = require('@utils/bridge')
const BigNumber = require('bignumber.js')
const MintableBurnableTokenAbi = require('@fuse/token-factory-contracts/abi/MintableBurnableToken')

const relayTokens = async (account, { depositId, accountAddress, bridgeType, bridgeAddress, tokenAddress, receiver, amount }, job) => {
  const deposit = await Deposit.findById(depositId)
  await deposit.set('jobs.relayTokens', job._id).save()
  try {
    const network = createNetwork(bridgeType, account)
    const allowance = await utils.getAllowance(network, { tokenAddress, owner: accountAddress, spender: bridgeAddress })
    const hasAllowance = new BigNumber(allowance).isGreaterThanOrEqualTo(amount.toString())
    if (!hasAllowance) {
      const approveReceipt = await utils.approve(network, { from: accountAddress, tokenAddress, spender: bridgeAddress, infinite: true })
      await job.set('data.txHashes.approve', approveReceipt.txHash).save()
      if (!approveReceipt.status) {
        console.error(`Approving failed with receipt: ${JSON.stringify(approveReceipt)} `)
        throw new Error(`Failed to approve in txHash: ${approveReceipt.txHash}`)
      }
    }
    const relayTokensReceipt = await bridgeUtils.relayTokens(network, { from: accountAddress, bridgeAddress, tokenAddress, receiver, amount })
    await job.set('data.txHashes.relayTokens', relayTokensReceipt.txHash).save()
    if (!relayTokensReceipt.status) {
      throw new Error(`Relaying failed with receipt: ${JSON.stringify(relayTokensReceipt)} `)
    }
    if (relayTokensReceipt.status) {
      await deposit.set('status', 'succeeded').save()
    } else {
      throw new Error(`tx failed to mint ${relayTokensReceipt.txHash}`)
    }
    return relayTokensReceipt
  } catch (error) {
    await deposit.set('status', 'failed').save()
    throw error
  }
}

const mintOnRelay = async (account, { actionOnRelayId, initiatorId, bridgeType, tokenAddress, amount, mintTo }, job) => {
  const actionOnRelay = await ActionOnRelay.findById(actionOnRelayId)
  if (!actionOnRelay) {
    console.error(`action with ${actionOnRelayId} id not found`)
    return
  }

  if (actionOnRelay.status !== 'ready') {
    console.error(`action with ${actionOnRelayId} id got wrong action status ${actionOnRelay.status}`)
    return
  }

  const deposit = await Deposit.findById(initiatorId)
  await deposit.set('jobs.mintOnRelay', job._id).save()

  try {
    const { createContract, createMethod, send } = createNetwork(bridgeType, account)
    const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)
    const method = createMethod(tokenContractInstance, 'mint', mintTo, amount)

    const receipt = await send(method, {
      from: account.address
    }, {
      job
    })

    if (receipt.status) {
      actionOnRelay.status = 'succeeded'
      await deposit.set('status', 'succeeded').save()
    } else {
      actionOnRelay.status = 'failed'
    }
    await actionOnRelay.save()
  } catch (e) {
    actionOnRelay.status = 'failed'
    await actionOnRelay.save()
    throw e
  }
}

const mintDeposited = async (account, { depositId, bridgeType, tokenAddress, receiver, amount }, job) => {
  const deposit = await Deposit.findById(depositId)
  await deposit.set('jobs.mintDeposited', job._id).save()

  if (deposit.status !== 'started') {
    throw new Error(`deposit status is ${deposit.status} instead of done`)
  }

  try {
    const { createContract, createMethod, send } = createNetwork(bridgeType, account)
    const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)
    const method = createMethod(tokenContractInstance, 'mint', receiver, amount)

    const receipt = await send(method, {
      from: account.address
    }, {
      job
    })

    if (receipt.status) {
      await deposit.set('status', 'succeeded').save()
    } else {
      throw new Error(`tx failed to mint ${receipt.txHash}`)
    }
  } catch (e) {
    await deposit.set('status', 'failed').save()
    throw e
  }
}

module.exports = {
  relayTokens,
  mintOnRelay,
  mintDeposited
}
