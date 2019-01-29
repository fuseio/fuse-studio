
module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema

  const PartnerSchema = new Schema({
    name: {type: String, required: [true, "can't be blank"], unique: true, index: true},
    title: {type: String, required: [true, "can't be blank"]},
    author: {type: String, required: [true, "can't be blank"]},
    category: {type: String},
    description: {type: String, required: [true, "can't be blank"]},
    website: {type: String, required: [true, "can't be blank"]},
    image: {type: String},
    social: {type: Object}
  }, {timestamps: true})

  PartnerSchema.set('toJSON', {
    versionKey: false
  })

  const Partner = mongoose.model('Partner', PartnerSchema)

  function partner () {}

  partner.getModel = () => {
    return Partner
  }

  return partner
}
