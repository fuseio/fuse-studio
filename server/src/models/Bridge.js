const mongoose = require('mongoose')
const { Schema } = mongoose

const BridgeSchema = new Schema({
  foreignTokenAddress: { type: String, required: [true, "can't be blank"] },
  homeTokenAddress: { type: String, required: [true, "can't be blank"] },
  foreignBridgeAddress: { type: String, required: [true, "can't be blank"] },
  homeBridgeAddress: { type: String, required: [true, "can't be blank"] },
  foreignBridgeBlockNumber: { type: Number, required: [true, "can't be blank"] },
  homeBridgeBlockNumber: { type: Number, required: [true, "can't be blank"] }
})

BridgeSchema.index({ foreignTokenAddress: 1 })
BridgeSchema.index({ homeTokenAddress: 1 }, { unique: true })

const Bridge = mongoose.model('Bridge', BridgeSchema)

module.exports = Bridge
