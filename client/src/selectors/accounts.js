import { createSelector } from 'reselect'
import {getSelectedCommunity} from 'selectors/communities'
import {getAddresses, getNetworkType} from 'selectors/network'
import {initialAccount} from 'reducers/accounts'

export const getAccountAddress = state => state.network.accountAddress

export const getAccount = createSelector(
  getAccountAddress,
  state => state.accounts,
  (accountAddress, accounts) => accounts[accountAddress] || initialAccount
)

export const getBalances = createSelector(
  getAccount,
  (account) => account.balances || {}
)

export const getSelectedCommunityBalance = createSelector(
  getSelectedCommunity,
  getBalances,
  (community, balances) => balances[community.address]
)

export const getAccountTokens = createSelector(
  state => state.entities.tokens,
  getAccount,
  (tokens, account) => account.tokens.map(token => tokens[token.address] || {})
)

export const getClnBalance = createSelector(
  getNetworkType,
  getAddresses,
  getAccount,
  (network, addresses, account) => network === 'fuse'
    ? account.balanceOfNative
    : addresses ? account.balances[addresses.ColuLocalNetwork] : undefined
)
