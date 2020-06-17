const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const { Schema } = mongoose

const WalletTransactionSchema = new Schema({
  status: { type: String, required: [true, "can't be blank"] },
  network: { type: String, required: [true, "can't be blank"] },
  timeStamp: { type: Date, required: [true, "can't be blank"] },
  timePending: { type: String },
  hash: { type: String, required: [true, "can't be blank"] },
  from: { type: String, required: [true, "can't be blank"] },
  to: { type: String, required: [true, "can't be blank"] },
  value: { type: String, required: [true, "can't be blank"] },
  contractCall: { type: Object },
  netBalanceChanges: { type: Object },
  tokenAddress: { type: String },
  asset: { type: String },
  watchedAddress: { type: String, required: [true, "can't be blank"] }
}, { timestamps: true })

WalletTransactionSchema.index({ hash: 1, status: 1 }, { unique: true })

WalletTransactionSchema.plugin(mongoosePaginate)

const WalletTransaction = mongoose.model('WalletTransaction', WalletTransactionSchema)

module.exports = WalletTransaction
