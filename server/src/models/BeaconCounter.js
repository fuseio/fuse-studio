const mongoose = require('mongoose')
const { Schema } = mongoose

const BeaconCounterSchema = new Schema({
  proximityUUID: { type: String, required: true },
  major: { type: Number, default: 0 },
  minor: { type: Number, default: 0 }
}, { timestamps: true })

const BeaconCounter = mongoose.model('BeaconCounter', BeaconCounterSchema)

module.exports = BeaconCounter
