const mongoose = require('mongoose')
const { Schema } = mongoose

const WalletUpgradeSchema = new Schema({
  contractAddress: { type: String, required: [true, "can't be blank"] },
  version: { type: String },
  order: { type: Number },
  enabledModules: { type: Object },
  disabledModules: { type: Object }
}, { timestamps: true })

WalletUpgradeSchema.index({ version: 1 }, { unique: true })
WalletUpgradeSchema.index({ order: 1 }, { unique: true })
WalletUpgradeSchema.index({ contractAddress: 1 }, { unique: true })

const WalletUpgrade = mongoose.model('WalletUpgrade', WalletUpgradeSchema)

module.exports = WalletUpgrade
