
module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema
  const BridgeSchema = new Schema({
    foreignTokenAddress: {type: String, required: [true, "can't be blank"]},
    homeTokenAddress: {type: String, required: [true, "can't be blank"]},
    foreignBridgeAddress: {type: String, required: [true, "can't be blank"]},
    homeBridgeAddress: {type: String, required: [true, "can't be blank"]},
    foreignBridgeBlockNumber: {type: Number, required: [true, "can't be blank"]},
    homeBridgeBlockNumber: {type: Number, required: [true, "can't be blank"]}
  })

  BridgeSchema.index({foreignTokenAddress: 1}, {unique: true})
  BridgeSchema.index({homeTokenAddress: 1}, {unique: true})

  BridgeSchema.post('save', bridge => {
    const {bridgeDeployed} = require('@utils/tokenProgress')
    bridgeDeployed(bridge.foreignTokenAddress)
  })

  const Bridge = mongoose.model('Bridge', BridgeSchema)

  function bridge () {}

  bridge.getModel = () => {
    return Bridge
  }

  return bridge
}
