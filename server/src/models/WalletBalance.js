const mongoose = require('mongoose')
const { Schema } = mongoose

const WalletBalanceSchema = new Schema({
  walletAddress: { type: String, required: [true, "can't be blank"] },
  tokenAddress: { type: String, required: [true, "can't be blank"] },
  amount: { type: String, required: [true, "can't be blank"] },
  humanAmount: { type: Number, required: [true, "can't be blank"] },
  blockNumber: { type: Number, required: [true, "can't be blank"] },
  blockHash: { type: String, required: [true, "can't be blank"] },
  blockTimestamp: { type: Number, required: [true, "can't be blank"] },
  transactionHash: { type: String, required: [true, "can't be blank"] }
}, { timestamps: true, default: {} })

WalletBalanceSchema.index({ phoneNumber: 1, accountAddress: 1, appName: 1 })

const UserWallet = mongoose.model('WalletBalance', WalletBalanceSchema)

module.exports = UserWallet
