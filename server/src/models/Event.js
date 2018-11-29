
module.exports = (mongoose) => {
  mongoose = mongoose || require('mongoose')
  const EventSchema = new mongoose.Schema({
    eventName: {type: String, required: [true, "can't be blank"]},
    blockNumber: {type: Number, required: [true, "can't be blank"]},
    address: {type: String, required: [true, "can't be blank"]},
    transactionHash: {type: String, required: [true, "can't be blank"]},
    logIndex: {type: Number, required: [true, "can't be blank"]}
  }, {timestamps: true})

  EventSchema.index({transactionHash: 1, logIndex: 1}, { unique: true })
  EventSchema.index({eventName: 1, blockNumber: 1})

  EventSchema.set('toJSON', {
    versionKey: false
  })

  const Event = mongoose.model('Event', EventSchema)

  function event () {}

  event.create = (data) => {
    return new Promise((resolve, reject) => {
      const event = new Event(data)
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

  event.getById = (id) => {
    return new Promise((resolve, reject) => {
      Event.findById(id, (err, doc) => {
        if (err) {
          return reject(err)
        }
        if (!doc) {
          err = `Event with not found for id ${id}`
          return reject(err)
        }
        resolve(doc)
      })
    })
  }

  event.getLastEvent = (eventName) => {
    return new Promise((resolve, reject) => {
      Event.findOne({eventName}).sort({blockNumber: -1}).exec((err, doc) => {
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
