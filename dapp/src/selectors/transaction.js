import { createSelector } from 'reselect'

export const getTransaction = (state, transactionHash) => {
  if (transactionHash) {
    const transactions = getTransactions(state)
    return transactions[transactionHash]
  }
}

export const getTransactions = createSelector(
  state => state.transactions,
  transactions => transactions
)
