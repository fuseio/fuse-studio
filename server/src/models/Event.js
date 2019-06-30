const pickBy = require('lodash').pickBy
const mongoose = require('mongoose')

const manipulate = (data) => {
  // deleting double entries in returnValues
  const returnValues = pickBy(data.returnValues, (value, key) => isNaN(key))
  return { ...data, returnValues }
}

module.exports = () => {
  const EventSchema = new mongoose.Schema({
    eventName: { type: String, required: [true, "can't be blank"] },
    blockNumber: { type: Number, required: [true, "can't be blank"] },
    address: { type: String, required: [true, "can't be blank"] },
    transactionHash: { type: String, required: [true, "can't be blank"] },
    logIndex: { type: Number, required: [true, "can't be blank"] },
    returnValues: { type: Object }
  }, { timestamps: true })

  EventSchema.index({ transactionHash: 1, logIndex: 1 }, { unique: true })
  EventSchema.index({ eventName: 1, blockNumber: 1 })

  EventSchema.set('toJSON', {
    versionKey: false
  })

  const Event = mongoose.model('Event', EventSchema)

  function event () {}

  event.create = (data) => {
    return new Promise((resolve, reject) => {
      const event = new Event(manipulate(data))
      event.save((err, newObj) => {
        if (err) {
          return reject(err)
        }
        if (!newObj) {
          let err = 'Event not saved'
          return reject(err)
        }
        resolve(newObj)
      })
    })
  }

  event.getLastEvent = (conditions) => {
    return new Promise((resolve, reject) => {
      Event.findOne(conditions).sort({ blockNumber: -1 }).exec((err, doc) => {
        if (err) {
          console.log(err)
          return reject(err)
        }
        resolve(doc)
      })
    })
  }

  event.getModel = () => {
    return Event
  }

  return event
}
