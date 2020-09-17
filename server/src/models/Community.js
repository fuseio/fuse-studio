const mongoose = require('mongoose')
const { Schema } = mongoose

const CommunitySchema = new Schema({
  communityAddress: { type: String, required: [true, "can't be blank"] },
  homeTokenAddress: { type: String },
  foreignTokenAddress: { type: String },
  homeBridgeAddress: { type: String },
  foreignBridgeAddress: { type: String },
  secondaryTokenAddress: { type: String },
  isClosed: { type: Boolean, default: false },
  plugins: { type: Object },
  customData: { type: Object },
  name: { type: String, required: [true, "can't be blank"] },
  communityURI: { type: String },
  coverPhoto: { type: String },
  description: { type: String },
  webUrl: { type: String },
  creatorAddress: { type: String },
  isMultiBridge: { type: Boolean, default: true }
}, { timestamps: true })

CommunitySchema.index({ communityAddress: 1 }, { unique: true })

const Community = mongoose.model('Community', CommunitySchema)

module.exports = Community
