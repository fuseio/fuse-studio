import request from 'superagent'

export const fetchTokens = (page, apiRoot) =>
  request.get(`${apiRoot}/tokens?page=${page}`).then(response => response.body)

export const fetchTokensByOwner = (owner, apiRoot) =>
  request.get(`${apiRoot}/tokens/owner/${owner}`).then(response => response.body)

export const fetchToken = (address, apiRoot) =>
  request.get(`${apiRoot}/tokens/${address}`).then(response => response.body)

export const fetchTokenStatistics = (address, activityType, interval, apiRoot) =>
  request.get(`${apiRoot}/stats/${activityType}/${address}?interval=${interval}`).then(response => response.body)
