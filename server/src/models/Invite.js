const mongoose = require('mongoose')
const { Schema } = mongoose

const InviteSchema = new Schema({
  inviterPhoneNumber: { type: String, required: [true, "can't be blank"] },
  inviterWalletAddress: { type: String, required: [true, "can't be blank"] },
  inviteePhoneNumber: { type: String, required: [true, "can't be blank"] },
  inviteeWalletAddress: { type: String },
  communityAddress: { type: String }
}, { timestamps: true })

InviteSchema.index({ inviterPhoneNumber: 1, inviteePhoneNumber: 1 })

InviteSchema.set('toJSON', {
  versionKey: false
})

const Invite = mongoose.model('Invite', InviteSchema)

module.exports = Invite
