const mongoose = require('mongoose')
const { Schema } = mongoose

const ContactSchema = new Schema({
  userWallet: { type: Schema.Types.ObjectId, ref: 'UserWallet' },
  phoneNumber: { type: String },
  walletAddress: { type: String },
  nonce: { type: Number },
  state: { type: String, enum: ['EMPTY', 'NEW', 'SYNCED'], default: 'EMPTY' }
}, { timestamps: true })

ContactSchema.index({ userWallet: 1, phoneNumber: 1, walletAddress: 1 })

const Contact = mongoose.model('Contact', ContactSchema)

module.exports = Contact
