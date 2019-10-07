const mongoose = require('mongoose')
const { Schema } = mongoose

const ProfileSchema = new Schema({
  account: { type: String, required: [true, "can't be blank"] },
  publicData: { type: Object, required: [true, "can't be blank"] }
}, { timestamps: true })

ProfileSchema.index({ account: 1 }, { unique: true })

ProfileSchema.set('toJSON', {
  versionKey: false
})

const Profile = mongoose.model('Profile', ProfileSchema)

module.exports = Profile
