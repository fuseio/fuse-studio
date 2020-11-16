const mongoose = require('mongoose')
const { Schema } = mongoose

const MetadataSchema = new Schema(
  {
    hash: { type: String },
    uri: { type: String },
    data: { type: Object }
  },
  { timestamps: true }
)

MetadataSchema.index({ hash: 1 }, { unique: true })

const Metadata = mongoose.model('Metadata', MetadataSchema)

module.exports = Metadata
