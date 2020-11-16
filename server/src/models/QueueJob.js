const mongoose = require('mongoose')
const { Schema } = mongoose

const QueueJobSchema = new Schema({
  name: { type: String, required: [true, "can't be blank"] },
  data: { type: Object },
  lastRunAt: { type: Date, default: Date.now },
  lastFinishedAt: { type: Date }
}, { timestamps: true })

const QueueJob = mongoose.model('QueueJob', QueueJobSchema)

module.exports = QueueJob
