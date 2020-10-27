const mongoose = require('mongoose')
const { Schema } = mongoose

const EthFundingSchema = new Schema({
  accountAddress: { type: String, required: true },
  funded: { type: Boolean, default: false },
  fundingDate: { type: Date },
  network: { type: String, default: 'ropsten' }
}, { timestamps: true })

EthFundingSchema.index({ accountAddress: 1, network: 1 }, { unique: true })

const EthFunding = mongoose.model('EthFunding', EthFundingSchema)

module.exports = EthFunding
