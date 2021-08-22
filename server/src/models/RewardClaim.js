const mongoose = require('mongoose')
const { Schema } = mongoose

const RewardClaimSchema = new Schema({
  walletAddress: { type: String, required: [true, "can't be blank"] },
  tokenAddress: { type: String, required: [true, "can't be blank"] },
  amount: { type: String, default: '0' },
  humanAmount: { type: Number, default: 0 },
  fromTimestamp: { type: Number, required: [true, "can't be blank"] },
  fromBlockNumber: { type: Number, required: [true, "can't be blank"] },
  syncTimestamp: { type: Number, required: [true, "can't be blank"] },
  syncBlockNumber: { type: Number, required: [true, "can't be blank"] },
  claimBlockNumber: { type: Number },
  claimTimestamp: { type: Number },
  nextClaimTimestamp: { type: Number, required: [true, "can't be blank"] },
  tokensPerSecond: { type: String },
  duration: { type: Number },
  isClaimed: { type: Boolean, default: false },
  transactionHash: { type: String }
}, { timestamps: true, default: {} })

RewardClaimSchema.index({ walletAddress: 1, tokenAddress: 1, syncBlockNumber: 1 }, { unique: true })
RewardClaimSchema.index({ walletAddress: 1, tokenAddress: 1, claimBlockNumber: 1 }, { unique: true })

const RewardClaim = mongoose.model('RewardClaim', RewardClaimSchema)

module.exports = RewardClaim
