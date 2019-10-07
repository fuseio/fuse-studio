const mongoose = require('mongoose')
const { Schema } = mongoose

const transform = (doc, ret, options) => ({ ...ret, amount: doc.amount ? doc.amount.toString() : undefined })

const TransferSchema = new Schema({
  from: { type: String, required: [true, "can't be blank"] },
  to: { type: String, required: [true, "can't be blank"] },
  tokenAddress: { type: String, required: [true, "can't be blank"] },
  amount: { type: mongoose.Types.Decimal128, required: [true, "can't be blank"] },
  bridgeType: { type: String, required: [true, "can't be blank"] },
  status: { type: String }
})

TransferSchema.set('toJSON', {
  transform
})

TransferSchema.set('toObject', {
  transform
})

TransferSchema.index({ externalId: 1 }, { unique: true })

const Transfer = mongoose.model('Transfer', TransferSchema)

module.exports = Transfer