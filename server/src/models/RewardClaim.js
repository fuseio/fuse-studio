const mongoose = require('mongoose')
const { Schema } = mongoose

const RewardClaimSchema = new Schema({
  walletAddress: { type: String, required: [true, "can't be blank"] },
  tokenAddress: { type: String, required: [true, "can't be blank"] },
  amount: { type: String, required: [true, "can't be blank"] },
  humanAmount: { type: Number, required: [true, "can't be blank"] },
  blockNumber: { type: Number, required: [true, "can't be blank"] },
  claimedAt: { type: Date },
  syncedAt: { type: Date },
  nextClaimAt: { type: Date, required: [true, "can't be blank"] },
  isClaimed: { type: Boolean, default: false },
  transactionHash: { type: String, required: [true, "can't be blank"] }
}, { timestamps: true, default: {} })

RewardClaimSchema.index({ phoneNumber: 1, accountAddress: 1, appName: 1 })

const RewardClaim = mongoose.model('RewardClaim', RewardClaimSchema)

module.exports = RewardClaim
