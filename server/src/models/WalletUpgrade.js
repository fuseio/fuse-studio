const mongoose = require('mongoose')
const { Schema } = mongoose

const WalletUpgradeSchema = new Schema({
  contractAddress: { type: String, required: [true, "can't be blank"] },
  version: { type: String },
  paddedVersion: { type: String },
  enabledModules: { type: Object },
  disabledModules: { type: Object }
}, { timestamps: true })

WalletUpgradeSchema.index({ version: 1 }, { unique: true })
WalletUpgradeSchema.index({ paddedVersion: 1 }, { unique: true })
WalletUpgradeSchema.index({ contractAddress: 1 }, { unique: true })

const WalletUpgrade = mongoose.model('WalletUpgrade', WalletUpgradeSchema)

module.exports = WalletUpgrade
