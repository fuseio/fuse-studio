import request from 'superagent'

export const fetchCommunity = (apiRoot, { communityAddress }) =>
  request.get(`${apiRoot}/communities/${communityAddress}`)
    .then(response => response.body)

export const addCommunityPlugin = (apiRoot, { communityAddress, plugin }) =>
  request.post(`${apiRoot}/communities/${communityAddress}/plugins`)
    .send({ plugin })
    .then(response => response.body)

export const updateCommunityMetadata = (apiRoot, { communityAddress, communityURI, description }) =>
  request.put(`${apiRoot}/communities/${communityAddress}`)
    .send({ communityURI, description })
    .then(response => response.body)

export const setSecondaryToken = (apiRoot, { communityAddress, secondaryTokenAddress, networkType, tokenType }) =>
  request.put(`${apiRoot}/communities/${communityAddress}/secondary`)
    .send({ secondaryTokenAddress, networkType, tokenType })
    .then(response => response.body)

export const inviteUserToCommunity = (apiRoot, { communityAddress, email, phoneNumber }) =>
  request.post(`${apiRoot}/communities/${communityAddress}/invite`)
    .send({ email, phoneNumber })
    .then(response => response.body)
