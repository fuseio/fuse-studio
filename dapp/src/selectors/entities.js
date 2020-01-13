import { createSelector } from 'reselect'
import { getAccountAddress } from './accounts'
import sortBy from 'lodash/sortBy'
import { toChecksumAddress } from 'web3-utils'

const { addresses: { fuse: { funder: funderAddress } } } = CONFIG.web3

export const getCommunityAddress = state => state.screens.dashboard && state.screens.dashboard.communityAddress

export const getEntities = createSelector(
  state => state.screens.communityEntities.listHashes,
  state => state.entities.metadata,
  (listHashes, metadata) => listHashes.map(hash => metadata[`ipfs://${hash}`]).filter(obj => !!obj)
)

export const getUsersEntities = createSelector(
  state => state.screens.communityEntities.usersResults,
  state => state.entities.communityEntities,
  (usersResults, communityEntities) => sortBy(usersResults.map(account => communityEntities[account]).filter(obj => !!obj), ['updatedAt']).reverse() || []
)

export const getBusinessesEntities = createSelector(
  state => state.screens.communityEntities.merchantsResults,
  state => state.entities.communityEntities,
  (merchantsResults, communityEntities) => sortBy(merchantsResults.map(account => communityEntities[account]).filter(obj => !!obj), ['updatedAt']).reverse() || []
)

export const checkIsAdmin = createSelector(
  getAccountAddress,
  getCommunityAddress,
  state => state.entities.communityEntities,
  (accountAddress, communityAddress, communityEntities) => {
    if (accountAddress) {
      const lowerCaseAddress = accountAddress.toLowerCase()
      return (communityEntities[lowerCaseAddress] &&
        communityEntities[lowerCaseAddress].isAdmin) || false
    }
  }
)

export const checkIsFunderPartOfCommunity = createSelector(
  getCommunityAddress,
  state => state.entities.communityEntities,
  (communityAddress, communityEntities) => {
    const funder = toChecksumAddress(funderAddress)
    return (communityEntities[funder] &&
      communityEntities[funder].communityAddress &&
      communityEntities[funder].communityAddress === communityAddress &&
      communityEntities[funder]) || false
  }
)
