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

  // function metadata () {}

  // metadata.create = md => {
  //   return new Promise((resolve, reject) => {
  //     md.data = Buffer.from(JSON.stringify(md.data))
  //     const metadata = new Metadata(md)
  //     metadata.save((err, newObj) => {
  //       if (err) {
  //         return reject(err)
  //       }
  //       if (!newObj) {
  //         return reject(new Error(`Metadata not saved`))
  //       }
  //       resolve(newObj.toJSON())
  //     })
  //   })
  // }

  // metadata.getByHash = hash => {
  //   return new Promise((resolve, reject) => {
  //     Metadata.findOne({ hash: hash }, (err, doc) => {
  //       if (err) {
  //         return reject(err)
  //       }
  //       if (!doc) {
  //         return reject(new Error(`Metadata not found for hash: ${hash}`))
  //       }
  //       resolve(doc.toJSON())
  //     })
  //   })
  // }

  // metadata.getModel = () => {
  //   return Metadata
  // }

  // return metadata

