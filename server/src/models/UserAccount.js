const mongoose = require('mongoose')
const { Schema } = mongoose

const UserAccountSchema = new Schema({
  studioUser: { type: Schema.Types.ObjectId, ref: 'StudioUser' },
  provider: { type: String, required: [true, "can't be blank"] },
  accountAddress: { type: String, required: [true, "can't be blank"] }
}, { timestamps: true })

UserAccountSchema.index({ accountAddress: 1 }, { unique: true })

const Modal = mongoose.model('UserAccount', UserAccountSchema)

module.exports = Modal
