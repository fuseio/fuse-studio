module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  mongoose.event = mongoose.event || require('./Event')(mongoose)
  mongoose.token = mongoose.token || require('./Token')(mongoose)
  mongoose.user = mongoose.user || require('./User')(mongoose)
  mongoose.business = mongoose.business || require('./Business')(mongoose)
  mongoose.businessList = mongoose.businessList || require('./BusinessList')(mongoose)
  mongoose.bridge = mongoose.bridge || require('./Bridge')(mongoose)
  mongoose.account = mongoose.account || require('./Account')(mongoose)
  mongoose.community = mongoose.community || require('./Community')(mongoose)
  mongoose.communityProgress = mongoose.communityProgress || require('./CommunityProgress')(mongoose)
  mongoose.entity = mongoose.entity || require('./Entity')(mongoose)
  return mongoose
}
