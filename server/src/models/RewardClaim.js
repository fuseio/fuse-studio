const mongoose = require('mongoose')
const { Schema } = mongoose

const RewardClaimSchema = new Schema({
  walletAddress: { type: String, required: [true, "can't be blank"] },
  tokenAddress: { type: String, required: [true, "can't be blank"] },
  amount: { type: String, default: '0' },
  humanAmount: { type: Number, default: 0 },
  syncTimestamp: { type: Number, required: [true, "can't be blank"] },
  syncBlockNumber: { type: Number, required: [true, "can't be blank"] },
  claimBlockNumber: { type: Number },
  claimTimestamp: { type: Number },
  nextClaimTimestamp: { type: Number },
  tokensPerSecond: { type: String },
  isClaimed: { type: Boolean, default: false },
  transactionHash: { type: String }
}, { timestamps: true, default: {} })

RewardClaimSchema.index({ phoneNumber: 1, accountAddress: 1, appName: 1 })

const RewardClaim = mongoose.model('RewardClaim', RewardClaimSchema)

module.exports = RewardClaim
