const mongoose = require('mongoose')
const { Schema } = mongoose

const ForkSchema = new Schema({
  appName: { type: String, required: [true, "can't be blank"] },
  deepLinkUrl: { type: String, required: [true, "can't be blank"] }
})

ForkSchema.index({ appName: 1 }, { unique: true })

const Fork = mongoose.model('Fork', ForkSchema)

module.exports = Fork
