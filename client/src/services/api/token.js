import request from 'superagent'

export const fetchTokens = (apiRoot, {page}) =>
  request.get(`${apiRoot}/tokens?page=${page}`)
    .then(response => response.body)

export const fetchTokensByOwner = (apiRoot, {owner}) =>
  request.get(`${apiRoot}/tokens/owner/${owner}`)
    .then(response => response.body)

export const fetchToken = (apiRoot, {tokenAddress}) =>
  request.get(`${apiRoot}/tokens/${tokenAddress}`).then(response => response.body)

export const fetchTokenStatistics = (apiRoot, {tokenAddress, activityType, interval}) =>
  request.get(`${apiRoot}/stats/${activityType}/${tokenAddress}?interval=${interval}`).then(response => response.body)

export const fetchTokensByAccount = (apiRoot, {accountAddress}) =>
  request.get(`${apiRoot}/balances/${accountAddress}`).then(response => response.body)
