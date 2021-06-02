import request from 'superagent'

export const fetchCommunity = (apiRoot, { communityAddress }) =>
  request.get(`${apiRoot}/communities/${communityAddress}`)
    .then(response => response.body)

export const addCommunityPlugin = (apiRoot, { jwtToken, communityAddress, plugin }) =>
  request.post(`${apiRoot}/communities/${communityAddress}/plugins`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({ plugin })
    .then(response => response.body)

export const updateCommunityMetadata = (apiRoot, { jwtToken, communityAddress, ...fields }) =>
  request.put(`${apiRoot}/communities/${communityAddress}`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({ ...fields })
    .then(response => response.body)

export const setSecondaryToken = (apiRoot, { jwtToken, communityAddress, secondaryTokenAddress, networkType, tokenType }) =>
  request.put(`${apiRoot}/communities/${communityAddress}/secondary`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({ secondaryTokenAddress, networkType, tokenType })
    .then(response => response.body)

export const inviteUserToCommunity = (apiRoot, { communityAddress, email, phoneNumber }) =>
  request.post(`${apiRoot}/communities/${communityAddress}/invite`)
    .send({ email, phoneNumber })
    .then(response => response.body)
