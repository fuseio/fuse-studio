import request from 'superagent'

export const createProfile = (apiRoot, { accountAddress, publicData }) =>
  request.put(`${apiRoot}/profiles/${accountAddress}`)
    .send({ publicData })
    .then(response => response.body)

export const isUserProfileExists = (apiRoot, { accountAddress }) =>
  request.get(`${apiRoot}/profiles/${accountAddress}`)
    .then(response => response.body)
