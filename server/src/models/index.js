require('./Account')
require('./Bridge')
require('./Community')
require('./Transfer')
require('./Deposit')
require('./Entity')
require('./Profile')
require('./UserWallet')

module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  mongoose.event = mongoose.event || require('./Event')(mongoose)
  mongoose.token = mongoose.token || require('./Token')(mongoose)
  mongoose.user = mongoose.user || require('./User')(mongoose)
  mongoose.communityProgress = mongoose.communityProgress || require('./CommunityProgress')(mongoose)
  mongoose.transaction = mongoose.transaction || require('./Transaction')(mongoose)
  return mongoose
}
