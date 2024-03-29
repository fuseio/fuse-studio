const mongoose = require('mongoose')
const { Schema } = mongoose

const CommunitySchema = new Schema({
  communityAddress: { type: String, required: [true, "can't be blank"] },
  homeTokenAddress: { type: String },
  foreignTokenAddress: { type: String },
  foreignNetworkType: { type: String },
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
  owner: { type: Schema.Types.ObjectId, ref: 'StudioUser' },
  isMultiBridge: { type: Boolean, default: false },
  bridgeType: { type: String, enum: ['multiple-erc20-to-erc20', 'multi-amb-erc20-to-erc677', 'amb-erc677-to-erc677'] },
  bridgeDirection: { type: String, enum: ['foreign-to-home', 'home-to-foreign'] },
  apiKey: { type: String }
}, { timestamps: true })

CommunitySchema.index({ communityAddress: 1 }, { unique: true })

const Community = mongoose.model('Community', CommunitySchema)

module.exports = Community
