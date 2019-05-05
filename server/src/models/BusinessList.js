
module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema
  const BusinessListSchema = new Schema({
    listAddress: { type: String, required: [true, "can't be blank"] },
    tokenAddress: { type: String, required: [true, "can't be blank"] },
    homeTokenAddress: { type: String, required: [true, "can't be blank"] },
    admin: { type: String, required: [true, "can't be blank"] }
  })

  BusinessListSchema.index({ listAddress: 1 }, { unique: true })
  BusinessListSchema.index({ tokenAddress: 1 }, { unique: true })

  BusinessListSchema.post('save', businessList => {
    const { businessListDeployed } = require('@utils/tokenProgress')
    businessListDeployed(businessList.tokenAddress)
  })

  const BusinessList = mongoose.model('BusinessList', BusinessListSchema)

  function businessList () {}

  businessList.getModel = () => {
    return BusinessList
  }

  return businessList
}
