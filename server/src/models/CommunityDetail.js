const mongoose = require('mongoose')
const { Schema } = mongoose

const CommunityDetailSchema = new Schema({
  name: { type: String, required: [true, "can't be blank"] },
  owner: { type: Schema.Types.ObjectId, ref: 'Account', required: [true, "can't be blank"] },
  bridgedToken: { type: Schema.Types.ObjectId, ref: 'BridgedToken', required: [true, "can't be blank"] },
  description: { type: String },
  webpageURL: { type: String }
}, { timestamps: true })

CommunityDetailSchema.index({ name: 1, owner: 1, bridgedToken: 1 }, { unique: true })

const CommunityDetail = mongoose.model('CommunityDetail', CommunityDetailSchema)

module.exports = CommunityDetail
