const mongoose = require('mongoose')
const { Schema } = mongoose

const UserWalletSchema = new Schema({
  phoneNumber: { type: String, required: [true, "can't be blank"] },
  accountAddress: { type: String, required: [true, "can't be blank"] },
  walletAddress: { type: String },
  firebaseToken: { type: String },
  contacts: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],
  backup: { type: Boolean, default: false },
  walletOwnerOriginalAddress: { type: String },
  walletFactoryOriginalAddress: { type: String },
  walletFactoryCurrentAddress: { type: String },
  walletImplementationOriginalAddress: { type: String },
  walletImplementationCurrentAddress: { type: String },
  walletModulesOriginal: { type: Object },
  walletModules: { type: Object },
  salt: { type: String, default: null },
  networks: [{ type: String }],
  identifier: { type: String },
  appName: { type: String }
}, { timestamps: true })

UserWalletSchema.index({ phoneNumber: 1, accountAddress: 1, appName: 1 })

const UserWallet = mongoose.model('UserWallet', UserWalletSchema)

module.exports = UserWallet
