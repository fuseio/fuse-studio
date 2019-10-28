import request from 'superagent'

export const fetchCommunity = (apiRoot, { communityAddress }) =>
  request.get(`${apiRoot}/communities/${communityAddress}`)
    .then(response => response.body)

export const addCommunityPlugins = (apiRoot, { communityAddress, plugins }) =>
  request.post(`${apiRoot}/communities/${communityAddress}`)
    .send({ plugins })
    .then(response => response.body)

export const addCommunityPlugin = (apiRoot, { communityAddress, plugin }) =>
  request.post(`${apiRoot}/communities/${communityAddress}/plugins`)
    .send({ plugin })
    .then(response => response.body)

export const updateCommunityPlugin = (apiRoot, { communityAddress, plugin }) =>
  request.put(`${apiRoot}/communities/${communityAddress}/plugins`)
    .send({ plugin })
    .then(response => response.body)
