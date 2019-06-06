import request from 'superagent'

export const fetchTokens = (apiRoot, { networkType, page }) =>
  request.get(`${apiRoot}/tokens?networkType=${networkType}&page=${page}`)
    .then(response => response.body)

export const fetchTokensByOwner = (apiRoot, { networkType, owner }) =>
  request.get(`${apiRoot}/tokens/owner/${owner}?networkType=${networkType}`)
    .then(response => response.body)

export const fetchToken = (apiRoot, { tokenAddress }) =>
  request.get(`${apiRoot}/tokens/${tokenAddress}`).then(response => response.body)

export const fetchTokenProgress = (apiRoot, { communityAddress }) =>
  request.get(`${apiRoot}/deployments?communityAddress=${communityAddress}`).then(response => response.body)

export const fetchDeployProgress = (apiRoot, { id }) =>
  request.get(`${apiRoot}/deployments/${id}`).then(response => response.body)

export const deployChosenContracts = (apiRoot, { steps, accountAddress }) =>
  request.post(`${apiRoot}/deployments`)
    .send({ steps, accountAddress })
    .then(response => response.body)

export const fetchTokenStatistics = (apiRoot, { tokenAddress, activityType, interval }) =>
  request.get(`${apiRoot}/stats/${activityType}/${tokenAddress}?interval=${interval}`).then(response => response.body)

export const fetchTokenList = (apiRoot, { accountAddress, networkSide }) =>
  request.get(`${apiRoot}/tokenlist/${networkSide}/${accountAddress}`).then(response => response.body)

export const deployBridge = (apiRoot, { foreignTokenAddress }) =>
  request.post(`${apiRoot}/bridges/${foreignTokenAddress}`).then(response => response.body)

export const fetchCommunity = (apiRoot, { communityAddress }) =>
  request.get(`${apiRoot}/communities/${communityAddress}`).then(response => response.body)
