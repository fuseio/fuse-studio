const validator = require('validator')
const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({
  email: { type: String, required: [true, "can't be blank"], validate: [ validator.isEmail, 'invalid email' ] },
  accountAddress: { type: String, required: [true, "can't be blank"] },
  provider: { type: String, required: [true, "can't be blank"] },
  source: { type: String, required: true },
  displayName: { type: String }
}, { timestamps: true })

UserSchema.index({ email: 1, accountAddress: 1 }, { unique: true })

const User = mongoose.model('User', UserSchema)

module.exports = User
