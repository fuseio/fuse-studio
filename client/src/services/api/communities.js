import request from 'superagent'

export const addCommunity = (community, apiRoot) =>
  request.post(`${apiRoot}/communities`).send({community}).then(response => response.body)

export const fetchCommunity = (address, apiRoot) =>
  request.get(`${apiRoot}/communities/${address}`).then(response => response.body)

export const fetchCommunityStatistics = (address, activityType, interval, apiRoot) =>
  request.get(`${apiRoot}/stats/${activityType}/${address}?interval=${interval}`).then(response => response.body)

export const fetchCommunities = (page, apiRoot) =>
  request.get(`${apiRoot}/communities?page=${page}`).then(response => response.body)

export const fetchCommunitiesByOwner = (owner, apiRoot) =>
  request.get(`${apiRoot}/communities/owner/${owner}`).then(response => response.body)

export const fetchTokensByAccount = (account, apiRoot) =>
  request.get(`${apiRoot}/balances/${account}`).then(response => response.body)
