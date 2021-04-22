const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const { Schema } = mongoose

const WalletActionSchema = new Schema({
  name: { type: String, required: [true, "can't be blank"] },
  communityAddress: { type: String },
  walletAddress: { type: String },
  tokenAddress: [ { type: String } ],
  job: { type: Schema.Types.ObjectId, ref: 'QueueJob' },
  data: { type: Object, default: {} },
  status: { type: String, default: 'pending' },
  failedAt: { type: Date },
  failReason: { type: String }
}, { timestamps: true })

WalletActionSchema.index({ communityAddress: 1 })
WalletActionSchema.index({ walletAddress: 1 })
WalletActionSchema.index({ tokenAddress: 1 })

WalletActionSchema.plugin(mongoosePaginate)

WalletActionSchema.methods.fail = function (reason) {
  if (reason instanceof Error) {
    reason = reason.message
  }
  this.failReason = reason
  this.failedAt = Date.now()
  this.status = 'failed'
}

WalletActionSchema.methods.failAndUpdate = function (reason) {
  if (reason instanceof Error) {
    reason = reason.message
  }
  return WalletAction.findByIdAndUpdate(this._id, { lastFinishedAt: Date.now(), failedAt: Date.now(), status: 'failed', failReason: reason })
}

WalletActionSchema.methods.successAndUpdate = function () {
  if (this.status === 'started') {
    return WalletAction.findByIdAndUpdate(this._id, { lastFinishedAt: Date.now(), status: 'succeeded' })
  } else {
    console.warn(`calling successAndUpdate on message with status ${this.status}`)
    return WalletAction.findByIdAndUpdate(this._id, { lastFinishedAt: Date.now() })
  }
}

const WalletAction = mongoose.model('WalletAction', WalletActionSchema)

module.exports = WalletAction
