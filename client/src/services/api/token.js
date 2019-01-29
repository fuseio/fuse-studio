import request from 'superagent'

export const fetchTokens = (apiRoot, {page}) =>
  request.get(`${apiRoot}/tokens?page=${page}`).then(response => response.body)

export const fetchTokensByOwner = (apiRoot, {owner}) =>
  request.get(`${apiRoot}/tokens/owner/${owner}`).then(response => response.body)

export const fetchToken = (apiRoot, {address}) =>
  request.get(`${apiRoot}/tokens/${address}`).then(response => response.body)

export const fetchTokenStatistics = (apiRoot, {address, activityType, interval}) =>
  request.get(`${apiRoot}/stats/${activityType}/${address}?interval=${interval}`).then(response => response.body)

export const fetchTokensByAccount = (apiRoot, {accountAddress}) =>
  request.get(`${apiRoot}/balances/${accountAddress}`).then(response => response.body)
