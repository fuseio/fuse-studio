
module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema

  const TokenProgressSchema = new Schema({
    tokenAddress: {type: String, required: [true, "can't be blank"]},
    steps: {type: Object, default: {}}
  }, {timestamps: true})

  TokenProgressSchema.index({tokenAddress: 1}, {unique: true})

  TokenProgressSchema.set('toJSON', {
    versionKey: false
  })

  const TokenProgress = mongoose.model('TokenProgress', TokenProgressSchema)

  function tokenProgress () {}

  tokenProgress.getModel = () => {
    return TokenProgress
  }

  return tokenProgress
}
