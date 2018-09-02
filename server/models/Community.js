const timestamps = require('mongoose-time')

module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema

  const CommunitySchema = new Schema({
    ccAddress: {type: String, required: [true, "can't be blank"]},
    mmAddress: {type: String, required: [true, "can't be blank"]},
    factoryAddress: {type: String, required: [true, "can't be blank"]},
    factoryType: {type: String, enum: ['CurrencyFactory', 'IssuanceFactory'], default: 'CurrencyFactory'},
    factoryVersion: {type: Number, default: 0},
    verified: {type: Boolean, default: false}
  }).plugin(timestamps())

  CommunitySchema.index({ccAddress: 1}, {unique: true})
  CommunitySchema.index({mmAddress: 1}, {unique: true})
  CommunitySchema.index({factoryAddress: 1})
  CommunitySchema.index({factoryAddress: 1, factoryType: 1, factoryVersion: 1})

  CommunitySchema.set('toJSON', {
    getters: true,
    virtuals: true,
    transform: (doc, ret, options) => {
      const safeRet = {
        id: ret._id.toString(),
        createdAt: ret.created_at,
        updatedAt: ret.updated_at,
        ccAddress: ret.ccAddress,
        mmAddress: ret.mmAddress,
        factoryAddress: ret.factoryAddress,
        factoryType: ret.factoryType,
        factoryVersion: ret.factoryVersion,
        verified: ret.verified
      }
      return safeRet
    }
  })

  const Community = mongoose.model('Community', CommunitySchema)

  function community () {}

  community.create = (data) => {
    return new Promise((resolve, reject) => {
      const community = new Community(data)
      community.save((err, newObj) => {
        if (err) {
          return reject(err)
        }
        if (!newObj) {
          let err = 'Community not saved'
          return reject(err)
        }
        resolve(newObj)
      })
    })
  }

  community.getById = (id) => {
    return new Promise((resolve, reject) => {
      Community.findById(id, (err, doc) => {
        if (err) {
          return reject(err)
        }
        if (!doc) {
          err = `Community with not found for id ${id}`
          return reject(err)
        }
        resolve(doc)
      })
    })
  }

  community.getByccAddress = (ccAddress) => {
    return new Promise((resolve, reject) => {
      Community.findOne({'ccAddress': ccAddress}, (err, doc) => {
        if (err) {
          return reject(err)
        }
        if (!doc) {
          err = `Community not found for ccAddress: ${ccAddress}`
          return reject(err)
        }
        resolve(doc)
      })
    })
  }

  community.getBymmAddress = (mmAddress) => {
    return new Promise((resolve, reject) => {
      Community.findOne({'mmAddress': mmAddress}, (err, doc) => {
        if (err) {
          return reject(err)
        }
        if (!doc) {
          err = `Community not found for mmAddress: ${mmAddress}`
          return reject(err)
        }
        resolve(doc)
      })
    })
  }

  community.getByFactory = (factoryAddress, factoryType, factoryVersion) => {
    return new Promise((resolve, reject) => {
      let query = {}
      if (factoryAddress) query.factoryAddress = factoryAddress
      if (factoryType) query.factoryType = factoryType
      if (factoryVersion) query.factoryVersion = factoryVersion
      Community.find(query, (err, docs) => {
        if (err) {
          return reject(err)
        }
        resolve(docs)
      })
    })
  }

  community.getModel = () => {
    return Community
  }

  return community
}
