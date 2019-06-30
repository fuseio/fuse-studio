const BigNumber = require('bignumber.js')

const transform = (doc, ret, options) => ({ ...ret, totalSupply: doc.totalSupply ? doc.totalSupply.toString() : undefined })

module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema

  const TokenSchema = new Schema({
    address: { type: String, required: [true, "can't be blank"] },
    name: { type: String, required: [true, "can't be blank"] },
    symbol: { type: String, required: [true, "can't be blank"] },
    tokenURI: { type: String },
    totalSupply: { type: mongoose.Types.Decimal128, required: [true, "can't be blank"] },
    owner: { type: String },
    factoryAddress: { type: String },
    blockNumber: { type: Number },
    tokenType: { type: String, required: [true, "can't be blank"] },
    networkType: { type: String }
  }, { timestamps: true })

  TokenSchema.index({ address: 1 })
  TokenSchema.index({ owner: 1 })
  TokenSchema.index({ blockNumber: -1 })

  TokenSchema.set('toJSON', {
    versionKey: false,
    transform
  })

  TokenSchema.set('toObject', {
    versionKey: false,
    transform
  })

  const Token = mongoose.model('Token', TokenSchema)

  function token () {}

  token.getByAddress = (address) => {
    return new Promise((resolve, reject) => {
      Token.findOne({ address }, (err, doc) => {
        if (err) {
          return reject(err)
        }
        if (!doc) {
          err = `Token not found for address: ${address}`
          return reject(err)
        }
        resolve(doc)
      })
    })
  }

  token.mintTokens = (address, value) => {
    return Token.updateOne({ address }, { $inc: { totalSupply: value } })
  }

  token.burnTokens = (address, value) => {
    const negatedValue = new BigNumber(value).negated().toString()
    return Token.updateOne({ address }, { $inc: { totalSupply: negatedValue } })
  }

  token.getModel = () => {
    return Token
  }

  return token
}
