import { createSelector } from 'reselect'

export const getAccount = createSelector(
  state => state.web3.accountAddress,
  state => state.accounts,
  (accountAddress, accounts) => accounts[accountAddress] || {}
)

export const getBalances = createSelector(
  getAccount,
  (account) => account.balances || {}
)
