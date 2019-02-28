module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  mongoose.community = mongoose.community || require('./Community')(mongoose)
  mongoose.event = mongoose.event || require('./Event')(mongoose)
  mongoose.tokenProgress = mongoose.tokenProgress || require('./TokenProgress')(mongoose)
  mongoose.token = mongoose.token || require('./Token')(mongoose)
  mongoose.user = mongoose.user || require('./User')(mongoose)
  mongoose.partner = mongoose.partner || require('./Partner')(mongoose)
  return mongoose
}
