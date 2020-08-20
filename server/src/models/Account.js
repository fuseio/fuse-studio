const mongoose = require('mongoose')
const { Schema } = mongoose

const AccountSchema = new Schema({
  address: { type: String, required: [true, "can't be blank"] },
  childIndex: { type: Number, required: [true, "can't be blank"] },
  nonces: { type: Object, default: { home: 0, foreign: 0 } },
  isLocked: { type: Boolean, default: false },
  lockingTime: { type: Date },
  role: { type: String, default: '*' },
  lockingReason: { type: String },
  network: { type: String, enum: ['home', 'foreign'] }
}, { timestamps: true })

AccountSchema.index({ address: 1, network: 1 }, { unique: true })

const Account = mongoose.model('Account', AccountSchema)

module.exports = Account
