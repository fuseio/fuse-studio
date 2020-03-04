const mongoose = require('mongoose')
const { Schema } = mongoose

const UserWalletSchema = new Schema({
  phoneNumber: { type: String, required: [true, "can't be blank"] },
  accountAddress: { type: String, required: [true, "can't be blank"] },
  walletAddress: { type: String },
  firebaseToken: { type: String },
  contacts: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],
  backup: { type: Boolean, default: false },
  walletFactoryOriginalAddress: { type: String },
  walletFactoryCurrentAddress: { type: String },
  walletImplementationOriginalAddress: { type: String },
  walletImplementationCurrentAddress: { type: String },
  walletModules: [{ type: Object }],
  salt: { type: String, default: null },
  networks: [{ type: String }]
}, { timestamps: true })

UserWalletSchema.index({ phoneNumber: 1, accountAddress: 1 })

const UserWallet = mongoose.model('UserWallet', UserWalletSchema)

module.exports = UserWallet
