var mongoose = require('mongoose')

var MetadataSchema = new mongoose.Schema({
  hash: {type: String, unique: true, required: [true, "can't be blank"], index: true},
  protocol: {type: String, required: [true, "can't be blank"], index: true},
  data: {type: mongoose.Schema.Types.Buffer}
}, {timestamps: true})

MetadataSchema.methods.tokenURI = function () {
  return `${this.protocol}://${this.hash}`
}

MetadataSchema.methods.toJSON = function () {
  return {
    protocol: this.protocol,
    hash: this.hash,
    data: JSON.parse(this.data.toString())
  }
}

mongoose.model('Metadata', MetadataSchema)
