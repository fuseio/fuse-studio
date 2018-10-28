import request from 'superagent'

export const API_ROOT = CONFIG.api.url

export const fetchMetadata = (protocol, hash) =>
  request.get(`${API_ROOT}/metadata/${protocol}/${hash}`)
    .then(response => response.body)

export const createMetadata = (metadata) =>
  request.post(`${API_ROOT}/metadata`)
    .send({metadata})
    .then(response => response.body)

export const addCommunity = (community) =>
  request.post(`${API_ROOT}/communities`).send({community}).then(response => response.body)

export const fetchCommunities = (page) =>
  request.get(`${API_ROOT}/communities?page=${page}`).then(response => response.body)

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
