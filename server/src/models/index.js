module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  mongoose.event = mongoose.event || require('./Event')(mongoose)
  mongoose.tokenProgress = mongoose.tokenProgress || require('./TokenProgress')(mongoose)
  mongoose.token = mongoose.token || require('./Token')(mongoose)
  mongoose.user = mongoose.user || require('./User')(mongoose)
  mongoose.business = mongoose.business || require('./Business')(mongoose)
  mongoose.businessList = mongoose.businessList || require('./BusinessList')(mongoose)
  mongoose.bridge = mongoose.bridge || require('./Bridge')(mongoose)
  mongoose.account = mongoose.account || require('./Account')(mongoose)
  return mongoose
}
