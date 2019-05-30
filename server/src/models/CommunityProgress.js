
module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema

  const CommunityProgressSchema = new Schema({
    communityAddress: { type: String },
    steps: { type: Object, default: {} },
    done: { type: Boolean }
  }, { timestamps: true, minimize: false })

  CommunityProgressSchema.index({ communityAddress: 1 })

  CommunityProgressSchema.set('toJSON', {
    versionKey: false
  })

  const CommunityProgress = mongoose.model('CommunityProgress', CommunityProgressSchema)

  function communityProgress () {}

  communityProgress.getModel = () => {
    return CommunityProgress
  }

  return communityProgress
}
