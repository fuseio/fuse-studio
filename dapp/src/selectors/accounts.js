import { createSelector } from 'reselect'
import { getAddresses, getNetworkType } from 'selectors/network'
import { initialAccount } from 'reducers/accounts'

export const getAccountAddress = state => state.network.accountAddress

export const getAccount = createSelector(
  getAccountAddress,
  state => state.accounts,
  (accountAddress, accounts) => accounts[accountAddress] || initialAccount
)

export const getUser3boxData = createSelector(
  getAccountAddress,
  state => state.accounts,
  (accountAddress, accounts) => {
    if (accounts[accountAddress] && (accounts[accountAddress].publicData || accounts[accountAddress].privateData)) {
      return {
        publicData: accounts[accountAddress].publicData,
        privateData: accounts[accountAddress].privateData
      }
    }
    return { publicData: {}, privateData: {} }
  }
)

export const getBalances = createSelector(
  getAccount,
  (account) => account.balances || {}
)

export const getAccountTokens = createSelector(
  state => state.entities.tokens,
  getAccount,
  (tokens, account) => account.tokens.map(token => tokens[token] || {})
)

export const getClnBalance = createSelector(
  getNetworkType,
  getAddresses,
  getAccount,
  (network, addresses, account) => network === 'fuse'
    ? account.balanceOfNative
    : addresses ? account.balances[addresses.FuseToken] : undefined
)
