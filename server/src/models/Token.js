const tokenIssued = require('@utils/tokenProgress').tokenIssued
const detailsGiven = require('@utils/tokenProgress').detailsGiven

module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema

  const TokenSchema = new Schema({
    address: {type: String, required: [true, "can't be blank"]},
    name: {type: String, required: [true, "can't be blank"]},
    symbol: {type: String, required: [true, "can't be blank"]},
    tokenURI: {type: String},
    totalSupply: {type: String, required: [true, "can't be blank"]},
    owner: {type: String, required: [true, "can't be blank"]},
    factoryAddress: {type: String, required: [true, "can't be blank"]},
    blockNumber: {type: Number}
  }, {timestamps: true})

  TokenSchema.index({address: 1}, {unique: true})
  TokenSchema.index({owner: 1})
  TokenSchema.index({blockNumber: -1})

  TokenSchema.set('toJSON', {
    versionKey: false
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

  token.upsertByccAddress = (data) => {
    const {address} = data
    return token.getModel().updateOne({address}, data, {upsert: true})
  }

  token.updateBymmAddress = (data) => {
    const {mmAddress} = data
    return token.getModel().updateOne({mmAddress}, data)
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

  token.getModel = () => {
    return Token
  }

  return token
}
