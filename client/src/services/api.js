import request from 'superagent'

const API_ROOT = CONFIG.api.url

export const fetchMetadata = (protocol, hash) =>
  request.get(`${API_ROOT}/metadata/${protocol}/${hash}`)
    .set({'Authorization': `Bearer ${window.localStorage.token}`})
    .then(response => response.body)

export const addMetadata = (metadata) =>
  request.post(`${API_ROOT}/metadata`)
    .set({'Authorization': `Bearer ${window.localStorage.token}`})
    .send({metadata})
    .then(response => response.body)

export const addCommunity = (community) =>
  request.post(`${API_ROOT}/communities`).send({community}).then(response => response.body)
