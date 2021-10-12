const mongoose = require('mongoose')
const { Schema } = mongoose

const BeaconSchema = new Schema({
  walletAddress: { type: String, required: true },
  proximityUUID: { type: String, required: false },
  major: { type: Number, required: true },
  minor: { type: Number, required: true }
}, { timestamps: true, default: {} })

BeaconSchema.index({ proximityUUID: 1, major: 1, minor: 1 }, { unique: true })

const Beacon = mongoose.model('Beacon', BeaconSchema)

module.exports = Beacon
