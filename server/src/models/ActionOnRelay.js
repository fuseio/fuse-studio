const mongoose = require('mongoose')
const { Schema } = mongoose

const transform = (doc, ret) => ({ ...ret, amount: doc.amount ? doc.amount.toString() : undefined })

const ActionOnRelaySchema = new Schema({
  accountAddress: { type: String, required: [true, "can't be blank"] },
  tokenAddress: { type: String, required: [true, "can't be blank"] },
  actionType: { type: String, required: [true, "can't be blank"] },
  bridgeType: { type: String, required: [true, "can't be blank"] },
  status: { type: String, required: [true, "can't be blank"] },
  initiatorId: { type: Schema.Types.ObjectId },
  data: { type: Object }
}, { timestamps: true })

ActionOnRelaySchema.set('toJSON', {
  transform
})

ActionOnRelaySchema.set('toObject', {
  transform
})

const ActionOnRelay = mongoose.model('ActionOnRelay', ActionOnRelaySchema)

module.exports = ActionOnRelay
