import { createSelector } from 'reselect'

export const getAccountAddress = state => state.web3.accountAddress

export const getAccount = createSelector(
  getAccountAddress,
  state => state.accounts,
  (accountAddress, accounts) => accounts[accountAddress] || {}
)

export const getBalances = createSelector(
  getAccount,
  (account) => account.balances || {}
)
