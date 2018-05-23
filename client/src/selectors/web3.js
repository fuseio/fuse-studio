import { createSelector } from 'reselect'

export const getAddresses = createSelector(
  state => state.web3.networkType,
  state => state.web3.addresses,
  (networkType, addresses) => addresses[networkType] || []
)
