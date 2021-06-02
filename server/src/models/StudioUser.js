const validator = require('validator')
const mongoose = require('mongoose')
const { Schema } = mongoose

const StudioUserSchema = new Schema({
  picture: { type: String },
  externalId: { type: String },
  displayName: { type: String },
  email: { type: String, required: [true, "can't be blank"], validate: [validator.isEmail, 'invalid email'] },
  firstName: { type: String, required: 'First name is required' },
  lastName: { type: String, required: 'Last name is required' },
  communitiesLimit: { type: Number }
}, { timestamps: true })

StudioUserSchema.index({ email: 1 }, { unique: true })

const Modal = mongoose.model('StudioUser', StudioUserSchema)

module.exports = Modal
