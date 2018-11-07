module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  mongoose.community = mongoose.community || require('./Community')(mongoose)
  mongoose.metadata = mongoose.metadata || require('./Metadata')(mongoose)
  return mongoose
}
