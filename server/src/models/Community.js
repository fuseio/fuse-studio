const mongoose = require('mongoose')
const { Schema } = mongoose

const CommunitySchema = new Schema({
  communityAddress: { type: String, required: [true, "can't be blank"] },
  homeTokenAddress: { type: String, required: [true, "can't be blank"] },
  foreignTokenAddress: { type: String },
  homeBridgeAddress: { type: String },
  foreignBridgeAddress: { type: String },
  secondaryTokenAddress: { type: String },
  isClosed: { type: Boolean, default: false },
  plugins: { type: Object },
  name: { type: String, required: [true, "can't be blank"] },
  communityURI: { type: String },
  coverPhoto: { type: String },
  description: { type: String },
  webUrl: { type: String }
}, { timestamps: true })

CommunitySchema.index({ communityAddress: 1 }, { unique: true })
CommunitySchema.index({ homeTokenAddress: 1 }, { unique: true })

const Community = mongoose.model('Community', CommunitySchema)

module.exports = Community
