const mongoose = require('mongoose')
const transactionMethods = mongoose.transaction
const { handleTransactionHash } = require('@handlers/receipts')

const proccessPendingTransactions = async () => {
  const transactions = await transactionMethods.getPending()
  for (let transaction of transactions) {
    await handleTransactionHash(transaction)
  }
}

module.exports = {
  proccessPendingTransactions
}
