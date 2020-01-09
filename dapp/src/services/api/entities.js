import request from 'superagent'
import { gql } from '@apollo/client'
import { client } from 'services/graphql'

const GET_COMMUNITY = (address) => {
  return gql`
    {
      communities (where: {address: "${address}"}) {
        entitiesList {
          id
          communityEntities {
            address
            isAdmin
            isApproved
            isUser
            isBusiness
          }
        }
      }
    }
  `
}

export const fetchCommunityEntities = ({ communityAddress }) => client.query({
  query: GET_COMMUNITY(communityAddress)
})
// export const fetchCommunityEntities = (apiRoot, { communityAddress, entityType }) => {
//   const path = entityType
//     ? `${apiRoot}/entities/${communityAddress}?type=${entityType}`
//     : `${apiRoot}/entities/${communityAddress}`
//   return request.get(path).then(response => response.body)
// }

export const createEntitiesMetadata = (apiRoot, { communityAddress, accountAddress, metadata }) =>
  request.put(`${apiRoot}/entities/${communityAddress}/${accountAddress}`)
    .send({ metadata })
    .then(response => response.body)

export const fetchEntity = (apiRoot, { communityAddress, account }) =>
  request.get(`${apiRoot}/entities/${communityAddress}/${account}`).then(response => response.body)

export const fetchEntityMetadata = (apiRoot, { communityAddress, account }) =>
  request.get(`${apiRoot}/entities/metadata/${communityAddress}/${account}`).then(response => response.body)

export const fetchCommunities = (apiRoot, { accountAddress }) =>
  request.get(`${apiRoot}/entities/account/${accountAddress}`).then(response => response.body)
