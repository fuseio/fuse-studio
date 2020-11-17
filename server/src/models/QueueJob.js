const mongoose = require('mongoose')
const { Schema } = mongoose

const QueueJobSchema = new Schema({
  name: { type: String, required: [true, "can't be blank"] },
  messageId: { type: String, required: [true, "can't be blank"] },
  data: { type: Object },
  status: { type: String, default: 'pending' },
  accountAddress: { type: String },
  lastFinishedAt: { type: Date },
  lastRunAt: { type: Date },
  failedAt: { type: Date },
  failReason: { type: String },
  failCount: { type: Number }
}, { timestamps: true })

QueueJobSchema.methods.fail = function (reason) {
  if (reason instanceof Error) {
    reason = reason.message
  }
  this.failReason = reason
  this.failCount = (this.failCount || 0) + 1
  this.status = 'failed'
}

const QueueJob = mongoose.model('QueueJob', QueueJobSchema)

module.exports = QueueJob
