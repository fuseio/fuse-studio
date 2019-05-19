import request from 'superagent'

export const fetchTokens = (apiRoot, { page }) =>
  request.get(`${apiRoot}/tokens?page=${page}`)
    .then(response => response.body)

export const fetchTokensByOwner = (apiRoot, { owner }) =>
  request.get(`${apiRoot}/tokens/owner/${owner}`)
    .then(response => response.body)

export const fetchToken = (apiRoot, { tokenAddress }) =>
  request.get(`${apiRoot}/tokens/${tokenAddress}`).then(response => response.body)

export const fetchTokenProgress = (apiRoot, { tokenAddress }) =>
  request.get(`${apiRoot}/tokens/progress/${tokenAddress}`).then(response => response.body)

export const deployChosenContracts = (apiRoot, { tokenAddress, steps }) =>
  request.post(`${apiRoot}/tokens/progress/deploy/${tokenAddress}`)
    .send({ steps })
    .then(response => response.body)

export const fetchTokenStatistics = (apiRoot, { tokenAddress, activityType, interval }) =>
  request.get(`${apiRoot}/stats/${activityType}/${tokenAddress}?interval=${interval}`).then(response => response.body)

export const fetchTokenList = (apiRoot, { accountAddress, networkSide }) =>
  request.get(`${apiRoot}/tokenlist/${networkSide}/${accountAddress}`).then(response => response.body)

export const deployBridge = (apiRoot, { foreignTokenAddress }) =>
  request.post(`${apiRoot}/bridges/${foreignTokenAddress}`).then(response => response.body)

export const fetchCommunity = (apiRoot, { tokenAddress }) =>
  request.get(`${apiRoot}/communities?tokenAddress=${tokenAddress}`).then(response => response.body)
