
module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const MetadataSchema = new mongoose.Schema({
    hash: {type: String, unique: true, required: [true, "can't be blank"], index: true},
    protocol: {type: String, required: [true, "can't be blank"], index: true},
    metadata: {type: mongoose.Schema.Types.Buffer}
  }, {timestamps: true})

  MetadataSchema.methods.tokenURI = function () {
    return `${this.protocol}://${this.hash}`
  }

  MetadataSchema.methods.toJSON = function () {
    return {
      protocol: this.protocol,
      hash: this.hash,
      metadata: JSON.parse(this.metadata.toString())
    }
  }

  const Metadata = mongoose.model('Metadata', MetadataSchema)

  function metadata () {}

  metadata.create = (data) => {
    return new Promise((resolve, reject) => {
      const metadata = new Metadata(data)
      metadata.save((err, newObj) => {
        if (err) {
          return reject(err)
        }
        if (!newObj) {
          let err = 'Metadata not saved'
          return reject(err)
        }
        resolve(newObj)
      })
    })
  }

  metadata.getById = (id) => {
    return new Promise((resolve, reject) => {
      Metadata.findById(id, (err, doc) => {
        if (err) {
          return reject(err)
        }
        if (!doc) {
          err = `Metadata with not found for id ${id}`
          return reject(err)
        }
        resolve(doc)
      })
    })
  }

  metadata.getByHash = (hash) => {
    return new Promise((resolve, reject) => {
      Metadata.findOne({'hash': hash}, (err, doc) => {
        if (err) {
          return reject(err)
        }
        if (!doc) {
          err = `Metadata not found for hash: ${hash}`
          return reject(err)
        }
        resolve(doc)
      })
    })
  }

  metadata.getByProtocolAndHash = (protocol, hash) => {
    return new Promise((resolve, reject) => {
      Metadata.findOne({'protocol': protocol, 'hash': hash}, (err, doc) => {
        if (err) {
          return reject(err)
        }
        if (!doc) {
          err = `Metadata not found for hash: ${hash}`
          return reject(err)
        }
        resolve(doc)
      })
    })
  }

  metadata.getModel = () => {
    return Metadata
  }

  return metadata
}
