const mongoose = require('mongoose')
const { Schema } = mongoose

const QueueJobSchema = new Schema({
  name: { type: String, required: [true, "can't be blank"] },
  messageId: { type: String },
  data: { type: Object },
  status: { type: String, default: 'pending' },
  accountAddress: { type: String },
  role: { type: String },
  lastFinishedAt: { type: Date },
  failedAt: { type: Date },
  failReason: { type: String },
  retryJob: { type: Schema.Types.ObjectId, ref: 'QueueJob' },
  failCount: { type: Number },
  communityAddress: { type: String }
}, { timestamps: true })

QueueJobSchema.index({ communityAddress: 1 })

QueueJobSchema.methods.fail = function (reason) {
  if (reason instanceof Error) {
    reason = reason.message
  }
  this.failReason = reason.toString()
  this.status = 'failed'
}

QueueJobSchema.methods.failAndUpdate = function (reason) {
  try {
    if (reason instanceof Error) {
      reason = reason.message
    }
    return QueueJob.findByIdAndUpdate(this._id, { lastFinishedAt: Date.now(), status: 'failed', failReason: reason })
  } catch (error) {
    console.log(`failed to call failAndUpdate on ${this._id}`)
    return QueueJob.findByIdAndUpdate(this._id, { lastFinishedAt: Date.now(), status: 'failed', failReason: error.reason })
  }
}

QueueJobSchema.methods.successAndUpdate = function () {
  if (this.status === 'started') {
    return QueueJob.findByIdAndUpdate(this._id, { lastFinishedAt: Date.now(), status: 'succeeded' })
  } else {
    console.warn(`calling successAndUpdate on message with status ${this.status}`)
    return QueueJob.findByIdAndUpdate(this._id, { lastFinishedAt: Date.now() })
  }
}

const QueueJob = mongoose.model('QueueJob', QueueJobSchema)

module.exports = QueueJob
