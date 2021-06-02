import request from 'superagent'
import { toLongName } from 'utils/network'

export const fetchTokens = (apiRoot, { networkType, page }) =>
  request.get(`${apiRoot}/tokens?networkType=${toLongName(networkType)}&page=${page}`)
    .then(response => response.body)

export const fetchTokensByOwner = (apiRoot, { networkType, owner }) =>
  request.get(`${apiRoot}/tokens/owner/${owner}?networkType=${toLongName(networkType)}`)
    .then(response => response.body)

export const fetchToken = (apiRoot, { tokenAddress }) =>
  request.get(`${apiRoot}/tokens/${tokenAddress}`).then(response => response.body)

export const fetchTokenProgress = (apiRoot, { communityAddress }) =>
  request.get(`${apiRoot}/deployments?communityAddress=${communityAddress}`).then(response => response.body)

export const fetchDeployProgress = (apiRoot, { id }) =>
  request.get(`${apiRoot}/deployments/${id}`).then(response => response.body)

export const deployChosenContracts = (apiRoot, { jwtToken, steps, accountAddress }) =>
  request.post(`${apiRoot}/deployments`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({ steps, accountAddress })
    .then(response => response.body)

export const fetchCommunity = (apiRoot, { communityAddress }) =>
  request.get(`${apiRoot}/communities/${communityAddress}`).then(response => response.body)

export const fetchFeaturedCommunities = (apiRoot) =>
  request.get(`${apiRoot}/communities/featured`).then(response => response.body)
