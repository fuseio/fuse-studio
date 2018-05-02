import request from 'superagent'

const API_ROOT = 'http://localhost:3000/api/v1'

export const fetchMetadata = (protocol, hash) =>
  request.get(`${API_ROOT}/metadata/${protocol}/${hash}`).then(response => response.body)

export const addMetadata = (metadata) =>
  request.post(`${API_ROOT}/metadata`).send({metadata}).then(response => response.body)

export const addCommunity = (community) =>
  request.post(`${API_ROOT}/communities`).send({community}).then(response => response.body)
