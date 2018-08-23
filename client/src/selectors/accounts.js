import { createSelector } from 'reselect'
import {getSelectedCommunity} from 'selectors/communities'
import {getAddresses} from 'selectors/network'

export const getAccountAddress = state => state.network.accountAddress

export const getAccount = createSelector(
  getAccountAddress,
  state => state.accounts,
  (accountAddress, accounts) => accounts[accountAddress] || {}
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

export const getClnBalance = createSelector(
  getAddresses,
  getBalances,
  (addressess, balances) => addressess ? balances[addressess.ColuLocalNetwork] : undefined
)
