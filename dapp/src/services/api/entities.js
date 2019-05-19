import request from 'superagent'

export const fetchCommunityEntities = (apiRoot, { communityAddress, entityType }) => {
  const path = entityType
    ? `${apiRoot}/entities/${communityAddress}?type=${entityType}`
    : `${apiRoot}/entities/${communityAddress}`
  return request.get(path).then(response => response.body)
}

export const createEntitiesMetadata = (apiRoot, { communityAddress, accountId, metadata }) =>
  request.put(`${apiRoot}/entities/${communityAddress}/${accountId}`)
    .send({ metadata })
    .then(response => response.body)

export const fetchEntity = (apiRoot, { communityAddress, account }) =>
  request.get(`${apiRoot}/entities/${communityAddress}/${account}`).then(response => response.body)
