
module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema
  const AccountSchema = new Schema({
    address: {type: String, required: [true, "can't be blank"]},
    bridgeType: {type: String, required: [true, "can't be blank"]},
    nonce: {type: Number, default: 0}
  })

  AccountSchema.statics.findOneOrCreate = async function findOneOrCreate (condition) {
    const one = await this.findOne(condition)

    return one || this.create(condition)
  }

  const Account = mongoose.model('Account', AccountSchema)

  function account () {}

  account.getModel = () => {
    return Account
  }

  return account
}
