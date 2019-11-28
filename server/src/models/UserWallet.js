const mongoose = require('mongoose')
const { Schema } = mongoose

const UserWalletSchema = new Schema({
  phoneNumber: { type: String, required: [true, "can't be blank"] },
  accountAddress: { type: String, required: [true, "can't be blank"] },
  walletAddress: { type: String }
}, { timestamps: true })

UserWalletSchema.index({ phoneNumber: 1, accountAddress: 1 }, { unique: true })

const UserWallet = mongoose.model('UserWallet', UserWalletSchema)

module.exports = UserWallet
