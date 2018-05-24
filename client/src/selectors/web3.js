import { createSelector } from 'reselect'

export const getNetworkType = state => state.web3.networkType

export const getAddresses = createSelector(
  getNetworkType,
  state => state.web3.addresses,
  (networkType, addresses) => addresses[networkType] || []
)
