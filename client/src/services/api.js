import request from 'superagent'

export const API_ROOT = CONFIG.api.url.default

export const fetchMetadata = (protocol, hash, apiRoot) =>
  request.get(`${apiRoot}/metadata/${protocol}/${hash}`)
    .then(response => response.body)

export const createMetadata = (metadata, apiRoot) =>
  request.post(`${apiRoot}/metadata`)
    .send({metadata})
    .then(response => response.body)

export const addUserInformation = (user, apiRoot) =>
  request.post(`${apiRoot}/users`).send({user}).then(response => response.body)

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

export const fetchTokens = (account, apiRoot) =>
  request.get(`${apiRoot}/balances/${account}`).then(response => response.body)

export const processReceipt = (receipt, apiRoot) =>
  request.post(`${apiRoot}/receipts/`).send({receipt}).then(response => response.body)

export const sendContactUs = (formData) => request.post(`${API_ROOT}/mails`)
  .send({formData})
  .then(response => response.body)

export const subcribeToMailingList = (formData) => request.post(`${API_ROOT}/subscriptions`)
  .send({formData})
  .then(response => response.body)

const symbolToTickerId = {
  'CLN': 2753,
  'ETH': 1027
}

export const fetchTokenQuote = (symbol, currency) => request.get(
  `https://api.coinmarketcap.com/v2/ticker/${symbolToTickerId[symbol]}/?convert=${currency}`
).then(response => response.body)
