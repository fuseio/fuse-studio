const mongoose = require('mongoose')
const { Schema } = mongoose

const WalletApySchema = new Schema({
  walletAddress: { type: String, required: [true, "can't be blank"] },
  isEnabled: { type: Boolean, default: false },
  sinceTimestamp: { type: Number },
  sinceBlockNumber: { type: Number }
}, { timestamps: true, collection: 'walletapy' })

WalletApySchema.index({ walletAddress: 1 }, { unique: true })

const WalletApy = mongoose.model('WalletApy', WalletApySchema)

module.exports = WalletApy
