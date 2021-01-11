const mongoose = require('mongoose')
const { Schema } = mongoose

const AccountBalanceSchema = new Schema({
  address: { type: String, required: [true, "can't be blank"] },
  bridgeType: { type: String, enum: ['home', 'foreign'], required: [true, "can't be blank"] },
  date: { type: Date, required: [true, "can't be blank"] },
  tokenBalances: { type: Object },
  tvlUSD: { type: mongoose.Decimal128 },
  description: { type: String }
}, { timestamps: true })

AccountBalanceSchema.index({ address: 1, bridgeType: 1, date: 1 }, { unique: true })

const AccountBalance = mongoose.model('AccountBalance', AccountBalanceSchema)

module.exports = AccountBalance
