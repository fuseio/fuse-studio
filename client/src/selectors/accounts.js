import { createSelector } from 'reselect'
import {getSelectedCommunity} from 'selectors/basicToken'
import {getAddresses} from 'selectors/web3'

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

export const getSelectedCommunityBalance = createSelector(
  getSelectedCommunity,
  getBalances,
  (community, balances) => balances[community.address]
)

export const getClnBalance = createSelector(
  getAddresses,
  getBalances,
  (addressess, balances) => balances[addressess.ColuLocalNetwork]
)
