const mongoose = require('mongoose')
const { get } = require('lodash')

module.exports = () => {
  const TransactionSchema = new mongoose.Schema({
    transactionHash: { type: String, required: [true, "can't be blank"] },
    status: { type: String, required: [true, "can't be blank"] },
    fetchRetries: { type: Number, default: 0 },
    abiName: { type: String },
    bridgeType: { type: String }
  }, { timestamps: true })

  TransactionSchema.index({ transactionHash: 1 }, { unique: true })
  TransactionSchema.index({ transactionName: 1, blockNumber: 1 })

  TransactionSchema.set('toJSON', {
    versionKey: false
  })

  const Transaction = mongoose.model('Transaction', TransactionSchema)

  function transaction () {}

  transaction.getModel = () => {
    return Transaction
  }

  transaction.start = async ({ transactionHash }) => {
    const transaction = await Transaction.findOne({ transactionHash })
    if (!transaction || get(transaction, 'status') === 'PENDING') {
      return Transaction.findOneAndUpdate({ transactionHash }, { status: 'STARTED' }, { upsert: true })
    }
    return transaction
  }

  transaction.pending = async ({ transactionHash, abiName, bridgeType }) => {
    const tx = await Transaction.findOne({ transactionHash })
    if (!tx) {
      return new Transaction({
        transactionHash,
        abiName,
        bridgeType,
        status: 'PENDING'
      }).save()
    }
  }

  transaction.done = ({ transactionHash }) => Transaction.findOneAndUpdate({ transactionHash }, { status: 'DONE' })

  transaction.failed = ({ transactionHash }) => Transaction.findOneAndUpdate({ transactionHash }, { status: 'FAILED' })

  transaction.getPending = () => Transaction.find({ status: 'PENDING' })

  return transaction
}
