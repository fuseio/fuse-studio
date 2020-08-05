
const router = require('express').Router()
const config = require('config')
const mongoose = require('mongoose')
const WalletTransaction = mongoose.model('WalletTransaction')
const UserWallet = mongoose.model('UserWallet')
const { toChecksumAddress, isAddress } = require('web3-utils')
const { AddressZero } = require('ethers/constants')
const BigNumber = require('bignumber.js')
const { mapValues, map, isObject } = require('lodash')
const { agenda } = require('@services/agenda')

const totlePrimaryAddress = config.get('network.foreign.addresses.TotlePrimary').toLowerCase()

const addressessToLowerCase = (obj) => (Array.isArray(obj) ? map : mapValues)(obj, (prop) => isObject(prop)
  ? addressessToLowerCase(prop)
  : isAddress(prop) ? prop.toLowerCase() : prop)

const isTotleSwap = (tx) =>
  !!tx.netBalanceChanges.find(netBalance => netBalance.address === totlePrimaryAddress)

const createTxFromNetBalanceChange = (tx, netBalanceChange, props) => {
  const { address, balanceChanges } = netBalanceChange
  const balanceChange = balanceChanges[0]
  const breakdown = balanceChange.breakdown[0]
  const delta = new BigNumber(balanceChange.delta)
  if (delta.isPositive()) {
    const to = address
    const from = breakdown.counterparty
    const value = delta.toString()
    const tokenAddress = balanceChange.asset.contractAddress || AddressZero
    const asset = balanceChange.asset.symbol
    return { ...tx, to, from, value, tokenAddress, asset, ...props }
  } else {
    const to = breakdown.counterparty
    const from = address
    const value = delta.abs().toString()
    const tokenAddress = balanceChange.asset.contractAddress || AddressZero
    const asset = balanceChange.asset.symbol
    return { ...tx, to, from, value, tokenAddress, asset, ...props }
  }
}
const createTransactions = (tx) => {
  const { watchedAddress } = tx
  if (tx.asset === 'ETH' && !tx.netBalanceChanges && !tx.contractCall) {
    console.log(`processing the ${tx.hash} as ETH transfer`)
    return [{ ...tx, tokenAddress: AddressZero }]
  } else if (tx.netBalanceChanges && tx.netBalanceChanges.length > 0) {
    const { netBalanceChanges } = tx
    console.log({ netBalanceChanges })
    if (isTotleSwap(tx)) {
      console.log(`processing the ${tx.hash} as totle swap by looking into netBalanceChanges`)
      console.log({ watchedAddress })
      const sentNetBalanceChange = tx.netBalanceChanges.find(netBalance => netBalance.address === totlePrimaryAddress)
      const receivedNetBalanceChange = netBalanceChanges.find(netBalance => netBalance.address === watchedAddress)
      console.log({ receivedNetBalanceChange })
      const sentTx = createTxFromNetBalanceChange(tx, sentNetBalanceChange, { isSwap: true, externalId: 1 })
      sentTx.from = watchedAddress
      console.log({ sentTx })
      const receivedTx = createTxFromNetBalanceChange(tx, receivedNetBalanceChange, { isSwap: true, externalId: 2 })
      return [receivedTx, sentTx]
    } else {
      console.log(`processing the ${tx.hash} as erc20 transfer by looking into netBalanceChanges`)
      return [createTxFromNetBalanceChange(tx, netBalanceChanges[0])]
    }
  } else if (tx.contractCall) {
    console.log(`processing the ${tx.hash} as ERC20 token transfer`)
    const { contractCall } = tx
    const { params, contractType } = contractCall
    if (contractType !== 'erc20') {
      throw new Error(`unsupported contract type ${contractType} from tx ${tx.hash}`)
    }
    const { _to, _value } = params
    return [{ ...tx, to: _to, value: _value, tokenAddress: tx.to }]
  } else {
    console.log(`Cannot process the ${tx.hash} transaction`)
    return []
  }
}

const updateWallet = async (tx, watchedAddress) => {
  const userWallet = await UserWallet.findOne({ walletAddress: toChecksumAddress(watchedAddress) })
  if (!userWallet) {
    console.warn(`address ${watchedAddress} does not have a user wallet`)
    return
  }

  let value
  if (!(userWallet.balancesOnForeign.get(tx.tokenAddress))) {
    value = tx.value
  } else {
    if (tx.to === watchedAddress) {
      value = new BigNumber(userWallet.balancesOnForeign.get(tx.tokenAddress)).plus(tx.value)
    } else {
      value = new BigNumber(userWallet.balancesOnForeign.get(tx.tokenAddress)).minus(tx.value)
    }
  }
  return UserWallet.updateOne({ walletAddress: toChecksumAddress(watchedAddress) }, { [`balancesOnForeign.${tx.tokenAddress}`]: value })
}

const createForeignWalletIfNeeded = async ({ watchedAddress, status }) => {
  if (status !== 'confirmed') {
    return
  }
  const userWallet = await UserWallet.findOne({ walletAddress: toChecksumAddress(watchedAddress) })
  const network = config.get('network.foreign.name')

  if (userWallet.networks.includes(network) || (userWallet.networks.pendingNetworks && userWallet.networks.pendingNetworks.includes(network))) {
    return
  }
  userWallet.pendingNetworks.push(network)
  await userWallet.save()
  const job = await agenda.now('createForeignWallet', { userWallet })
  console.log(`watchedAddress ${watchedAddress} does not have wallet on ${network}. Scheduling a job to create one ${job.attrs._id}`)
}

router.post('/', async (req, res) => {
  console.log(`receiving tx ${req.body.hash} for address ${req.body.watchedAddress} with status ${req.body.status} from blocknative`)
  console.log(req.body)
  if (req.body.status === 'speedup') {
    console.log(`ignoring the tx ${req.body.hash} because of the status ${req.body.status}`)
    return
  }

  await createForeignWalletIfNeeded(req.body)

  const txs = createTransactions(addressessToLowerCase(req.body))
  for (const receivedTx of txs) {
    const { hash, externalId, watchedAddress } = receivedTx
    const existingTx = await WalletTransaction.findOne({ hash, externalId })

    if (existingTx) {
      await WalletTransaction.findOneAndUpdate({ hash, externalId }, receivedTx)
    } else {
      await new WalletTransaction(receivedTx).save()
    }

    if (receivedTx.status === 'confirmed') {
      await updateWallet(receivedTx, watchedAddress)
    } else if (receivedTx.status === 'pending') {
      await updateWallet({ ...receivedTx, value: '0' }, watchedAddress)
    }
  }

  return res.send({ msg: 'success' })
})

module.exports = router
