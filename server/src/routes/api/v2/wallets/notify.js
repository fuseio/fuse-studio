
const router = require('express').Router()
const mongoose = require('mongoose')
const WalletTransaction = mongoose.model('WalletTransaction')
const UserWallet = mongoose.model('UserWallet')
const { toChecksumAddress, isAddress } = require('web3-utils')
const { AddressZero } = require('ethers/constants')
const BigNumber = require('bignumber.js')
const { mapValues } = require('lodash')

const addressessToLowerCase = (obj) => mapValues(obj, (prop) => typeof prop === 'object'
  ? addressessToLowerCase(prop)
  : isAddress(prop) ? prop.toLowerCase() : prop)

const manipulateTx = (tx) => {
  if (tx.asset === 'ETH' && !tx.netBalanceChanges && !tx.contractCall) {
    return addressessToLowerCase({ ...tx, tokenAddress: AddressZero })
  } else if (tx.netBalanceChanges && tx.netBalanceChanges.length > 0) {
    const { address, balanceChanges } = tx.netBalanceChanges[0]
    const balanceChange = balanceChanges[0]
    const breakdown = balanceChange.breakdown[0]
    const delta = new BigNumber(balanceChange.delta)
    if (delta.isPositive()) {
      const to = address
      const from = breakdown.counterparty
      const value = delta.toString()
      const tokenAddress = balanceChange.asset.contractAddress
      const asset = balanceChange.asset.symbol
      return addressessToLowerCase({ ...tx, to, from, value, tokenAddress, asset })
    } else {
      const to = breakdown.counterparty
      const from = address
      const value = delta.abs().toString()
      const tokenAddress = balanceChange.asset.contractAddress
      const asset = balanceChange.asset.symbol
      return addressessToLowerCase({ ...tx, to, from, value, tokenAddress, asset })
    }
  } else {
    const { contractCall } = tx
    const { params, contractType } = contractCall
    if (contractType !== 'erc20') {
      throw new Error(`unsupported contract type ${contractType} from tx ${tx.hash}`)
    }
    const { _to, _value } = params
    return addressessToLowerCase({ ...tx, to: _to, value: _value, tokenAddress: tx.to })
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

router.post('/', async (req, res) => {
  console.log(`receiving tx ${req.body.hash} from blocknative`)
  console.log(req.body)
  if (req.body.status === 'pending') {
    console.log('ignoring the pending tx')
  }
  const receivedTx = manipulateTx(req.body)
  const { hash, watchedAddress } = receivedTx
  const existingTx = await WalletTransaction.findOne({ hash })

  if (existingTx) {
    const { status, timePending, timeStamp } = req.body
    await WalletTransaction.findOneAndUpdate({ hash }, { status, timePending, timeStamp })
  } else {
    await new WalletTransaction(receivedTx).save()
  }

  if (receivedTx.status === 'confirmed') {
    await updateWallet(receivedTx, watchedAddress)
  }
  return res.send({ msg: 'success' })
})

module.exports = router
