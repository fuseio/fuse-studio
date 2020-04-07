const mongoose = require('mongoose')
const { Schema } = mongoose

const BridgedTokenSchema = new Schema({
  name: { type: String, required: [true, "can't be blank"] },
  foreignTokenAddress: { type: String, required: [true, "can't be blank"] },
  homeTokenAddress: { type: String, required: [true, "can't be blank"] },
  foreignBridgeAddress: { type: String, required: [true, "can't be blank"] },
  homeBridgeAddress: { type: String, required: [true, "can't be blank"] },
  foreignBridgeBlockNumber: { type: Number, required: [true, "can't be blank"] },
  homeBridgeBlockNumber: { type: Number, required: [true, "can't be blank"] }
}, { timestamps: true })

BridgedTokenSchema.index({ foreignTokenAddress: 1, homeTokenAddress: 1 }, { unique: true })

const BridgedToken = mongoose.model('BridgedToken', BridgedTokenSchema)

module.exports = BridgedToken
