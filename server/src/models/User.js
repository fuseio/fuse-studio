const validator = require('validator')

module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const Schema = mongoose.Schema

  const UserSchema = new Schema({
    fullName: {type: String, required: [true, "can't be blank"]},
    email: {type: String, required: [true, "can't be blank"], validate: [ validator.isEmail, 'invalid email' ]},
    ccAddress: {type: String, required: [true, "can't be blank"]},
    country: {type: String, required: [true, "can't be blank"]},
    receiveMail: {type: Boolean, default: false}
  }, {timestamps: true})

  UserSchema.index({ccAddress: 1}, {unique: true})

  UserSchema.set('toJSON', {
    versionKey: false
  })

  const User = mongoose.model('User', UserSchema)

  function user () {}

  user.create = (data) => {
    return new Promise((resolve, reject) => {
      const user = new User(data)
      user.save((err, newObj) => {
        if (err) {
          return reject(err)
        }
        if (!newObj) {
          let err = 'User not saved'
          return reject(err)
        }
        resolve(newObj)
      })
    })
  }

  user.getModel = () => {
    return User
  }

  return user
}
