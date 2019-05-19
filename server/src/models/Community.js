
module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema
  const CommunitySchema = new Schema({
    communityAddress: { type: String, required: [true, "can't be blank"] },
    entitiesListAddress: { type: String, required: [true, "can't be blank"] },
    tokenAddress: { type: String, required: [true, "can't be blank"] },
    homeTokenAddress: { type: String, required: [true, "can't be blank"] },
    isClosed: { type: Boolean, default: false }
  })

  CommunitySchema.index({ communityAddress: 1 }, { unique: true })
  CommunitySchema.index({ homeTokenAddress: 1 }, { unique: true })

  const Community = mongoose.model('Community', CommunitySchema)

  function community () {}

  community.getModel = () => {
    return Community
  }

  return community
}
