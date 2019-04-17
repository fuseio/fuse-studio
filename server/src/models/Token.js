const tokenIssued = require('@utils/tokenProgress').tokenIssued
const detailsGiven = require('@utils/tokenProgress').detailsGiven
const BigNumber = require('bignumber.js')

const transform = (doc, ret, options) => ({...ret, totalSupply: doc.totalSupply ? doc.totalSupply.toString() : undefined})

module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema

  const TokenSchema = new Schema({
    address: {type: String, required: [true, "can't be blank"]},
    name: {type: String, required: [true, "can't be blank"]},
    symbol: {type: String, required: [true, "can't be blank"]},
    tokenURI: {type: String},
    totalSupply: {type: mongoose.Types.Decimal128, required: [true, "can't be blank"]},
    owner: {type: String, required: [true, "can't be blank"]},
    factoryAddress: {type: String, required: [true, "can't be blank"]},
    blockNumber: {type: Number},
    tokenType: {type: String, required: [true, "can't be blank"]}
  }, {timestamps: true})

  TokenSchema.index({address: 1}, {unique: true})
  TokenSchema.index({owner: 1})
  TokenSchema.index({blockNumber: -1})

  TokenSchema.set('toJSON', {
    versionKey: false,
    transform
  })

  TokenSchema.set('toObject', {
    versionKey: false,
    transform
  })

  TokenSchema.post('save', token => {
    tokenIssued(token.address)
  })

  TokenSchema.post('save', async token => {
    const User = mongoose.model('User')
    const user = await User.findOne({accountAddress: token.owner})
    if (user) {
      detailsGiven(token.address)
    }
  })

  const Token = mongoose.model('Token', TokenSchema)

  function token () {}

  token.create = (data) => {
    return new Promise((resolve, reject) => {
      const token = new Token(data)
      token.save((err, newObj) => {
        if (err) {
          return reject(err)
        }
        if (!newObj) {
          let err = 'Token not saved'
          return reject(err)
        }
        resolve(newObj)
      })
    })
  }

  token.getById = (id) => {
    return new Promise((resolve, reject) => {
      Token.findById(id, (err, doc) => {
        if (err) {
          return reject(err)
        }
        if (!doc) {
          err = `Token with not found for id ${id}`
          return reject(err)
        }
        resolve(doc)
      })
    })
  }

  token.getByAddress = (address) => {
    return new Promise((resolve, reject) => {
      Token.findOne({address}, (err, doc) => {
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
    return Token.updateOne({address}, {$inc: {totalSupply: value}})
  }

  token.burnTokens = (address, value) => {
    const negatedValue = new BigNumber(value).negated().toString()
    return Token.updateOne({address}, {$inc: {totalSupply: negatedValue}})
  }

  token.getModel = () => {
    return Token
  }

  return token
}
