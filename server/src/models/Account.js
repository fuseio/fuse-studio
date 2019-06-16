
module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema
  const AccountSchema = new Schema({
    address: { type: String, required: [true, "can't be blank"] },
    childIndex: { type: Number, required: [true, "can't be blank"] },
    nonces: { type: Object, default: {} },
    isLocked: { type: Boolean, default: false },
    lockingTime: { type: Date }
  })

  AccountSchema.index({ address: 1 }, { unique: true })

  const Account = mongoose.model('Account', AccountSchema)

  function account () {}

  account.getModel = () => {
    return Account
  }

  return account
}
