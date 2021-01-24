const mongoose = require('mongoose')
const { Schema } = mongoose

const transform = (doc, ret) => ({ ...ret, amount: doc.amount ? doc.amount.toString() : undefined })

const DepositSchema = new Schema({
  transactionHash: { type: String },
  walletAddress: { type: String, required: [true, "can't be blank"] },
  customerAddress: { type: String, required: [true, "can't be blank"] },
  tokenAddress: { type: String, required: [true, "can't be blank"] },
  amount: { type: String, required: [true, "can't be blank"] },
  provider: { type: String, required: [true, "can't be blank"] },
  externalId: { type: String, required: [true, "can't be blank"] },
  status: { type: String, required: [true, "can't be blank"] },
  type: { type: String, enum: ['simple', 'fuse-dollar'], required: [true, "can't be blank"] },
  jobs: { type: Object, default: {} }
}, { timestamps: true })

DepositSchema.index({ externalId: 1 }, { unique: true })
DepositSchema.index({ provider: 1, externalId: 1 }, { unique: true })

DepositSchema.set('toJSON', {
  transform
})

DepositSchema.set('toObject', {
  transform
})

const Deposit = mongoose.model('Deposit', DepositSchema)

module.exports = Deposit
