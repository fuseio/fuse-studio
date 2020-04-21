const mongoose = require('mongoose')
const { Schema } = mongoose

const PhoneVerificationSchema = new Schema({
  phoneNumber: { type: String, required: [true, "can't be blank"] },
  code: { type: String },
  verified: { type: Boolean, default: false },
  count: { type: Number, default: 1 }
}, { timestamps: true })

PhoneVerificationSchema.index({ phoneNumber: 1 })

const PhoneVerification = mongoose.model('PhoneVerification', PhoneVerificationSchema)

module.exports = PhoneVerification
