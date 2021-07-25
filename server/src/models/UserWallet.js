const mongoose = require('mongoose')
const { Schema } = mongoose
const { ObjectId } = String.Types

const UserWalletSchema = new Schema({
  phoneNumber: { type: String, required: [true, "can't be blank"] },
  accountAddress: { type: String, required: [true, "can't be blank"] },
  walletAddress: { type: String },
  firebaseToken: { type: String },
  firebaseTokens: { type: Array },
  contacts: [{ type: ObjectId, ref: 'Contact' }],
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
  pendingNetworks: { type: Array, default: [] },
  identifier: { type: String },
  appName: { type: String },
  os: { type: String },
  ip: { type: String },
  balancesOnForeign: { type: Map, of: String, default: {} },
  upgrades: [{ type: ObjectId, ref: 'WalletUpgrade' }]
}, { timestamps: true, default: {} })

UserWalletSchema.index({ phoneNumber: 1, accountAddress: 1, appName: 1 })

const UserWallet = mongoose.model('UserWallet', UserWalletSchema)

module.exports = UserWallet
