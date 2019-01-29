import request from 'superagent'

export const fetchMetadata = (apiRoot, {protocol, hash}) =>
  request.get(`${apiRoot}/metadata/${protocol}/${hash}`)
    .then(response => response.body)

export const createMetadata = (apiRoot, {metadata}) =>
  request.post(`${apiRoot}/metadata`)
    .send({metadata})
    .then(response => response.body)
