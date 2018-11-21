import { createSelector } from 'reselect'

export const getNetworkType = state => state.network.networkType

export const getAddresses = createSelector(
  getNetworkType,
  state => state.network.addresses,
  (networkType, addresses) => addresses[networkType]
)

export const getCurrencyFactoryAddress = createSelector(
  getAddresses,
  (addresses) => addresses.CurrencyFactory
)

export const getClnAddress = createSelector(
  getAddresses,
  (addresses) => addresses.ColuLocalNetwork
)

export const getCommunityAddresses = createSelector(
  getAddresses,
  (addresses) => addresses ? [
    addresses.TelAvivCoinAddress,
    addresses.HaifaCoinAddress,
    addresses.LiverpoolCoinAddress
  ] : []
)

export const getTokenAddresses = createSelector(
  getAddresses,
  getCommunityAddresses,
  (addresses, communityAddresses) => addresses ? [
    addresses.ColuLocalNetwork
  ] : []
)

export const getEtherscanUrl = createSelector(
  getNetworkType,
  networkType => networkType === 'main'
    ? 'https://etherscan.io/'
    : 'https://ropsten.etherscan.io/'
)

export const getColuWallet = createSelector(
  getAddresses,
  (addresses) => addresses && addresses.ColuWallet
)

export const getApiRoot = createSelector(
  getNetworkType,
  networkType => CONFIG.api.url[networkType] || CONFIG.api.url.default
)
