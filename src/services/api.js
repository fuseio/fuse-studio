import request from 'superagent'

const API_ROOT = 'http://localhost:3000/api/v1'

export const fetchMetadata = (metadataHash) =>
  request.get(`${API_ROOT}/metadata/${metadataHash}`).then(response => response.body)

export const addMetadata = (metadata) =>
  request.post(`${API_ROOT}/metadata`).send({metadata}).then(response => response.body)
