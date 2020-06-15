
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
  if (tx.asset === 'ETH' && !tx.contractCall) {
    return addressessToLowerCase({ ...tx, tokenAddress: AddressZero })
  } else {
    const { contractCall } = tx
    console.log({ contractCall })
    const { params, contractType } = contractCall
    if (contractType !== 'erc20') {
      throw new Error(`unsupported contract type ${contractType} from tx ${tx.hash}`)
    }
    const { _to, _value } = params
    return addressessToLowerCase({ ...tx, to: _to, value: _value, tokenAddress: tx.to })
  }
}

const updateWallet = async (tx, address) => {
  const userWallet = await UserWallet.findOne({ walletAddress: toChecksumAddress(address) })

  let value
  if (!(userWallet.balancesOnForeign.get(tx.tokenAddress))) {
    value = tx.value
  } else {
    if (tx.to === 'address') {
      value = new BigNumber(userWallet.balancesOnForeign.get(tx.tokenAddress)).plus(tx.value)
    } else {
      value = new BigNumber(userWallet.balancesOnForeign.get(tx.tokenAddress)).minus(tx.value)
    }
  }
  return UserWallet.updateOne({ walletAddress: toChecksumAddress(address) }, { [`balancesOnForeign.${tx.tokenAddress}`]: value })
}

router.post('/', async (req, res) => {
  console.log(req.body)
  const receivedTx = manipulateTx(req.body)
  console.log({ receivedTx })
  const { hash, watchedAddress } = req.body
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
  return res.send({ ok: 2 })
})

module.exports = router
