import request from 'superagent'

export const fetchMetadata = (protocol, hash, apiRoot) =>
  request.get(`${apiRoot}/metadata/${protocol}/${hash}`)
    .then(response => response.body)

export const createMetadata = (metadata, apiRoot) =>
  request.post(`${apiRoot}/metadata`)
    .send({metadata})
    .then(response => response.body)
