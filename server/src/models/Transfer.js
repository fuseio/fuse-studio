const mongoose = require('mongoose')
const { Schema } = mongoose

const transform = (doc, ret) => ({ ...ret, amount: doc.amount ? doc.amount.toString() : undefined })

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

const Transfer = mongoose.model('Transfer', TransferSchema)

module.exports = Transfer
