import request from 'superagent'
import { gql } from '@apollo/client'
import { client } from 'services/graphql'

const GET_COMMUNITY_BUSINESSES_QUERY = (address) => {
  return gql`
    {
      communities(where:{address: "${address}"}) {
        entitiesList {
          communityEntities(where:{isBusiness: true}, first:1000) {
            isBusiness
          }
        }
      }
    }
  `
}

const GET_COMMUNITY_USERS_QUERY = (address) => {
  return gql`
    {
      communities(where:{address: "${address}"}) {
        entitiesList {
          communityEntities(where:{isUser: true}, first:1000) {
            isUser
          }
        }
      }
    }
  `
}

const GET_COMMUNITY = (address) => {
  return gql`
    {
      communities (where: {address: "${address}"}) {
        entitiesList {
          id
          communityEntities (first: 1000) {
            address
            isAdmin
            isApproved
            isUser
            isBusiness,
            createdAt
          }
        }
      }
    }
  `
}

const FETCH_WALLETS = gql`
  query Wallets($accounts: [String]!)
    {
      wallets(first: 1000, where: {address_in: $accounts}) {
        address,
        owner
      }
    }
  `

export const fetchCommunityEntities = ({ communityAddress }) => client.query({
  query: GET_COMMUNITY(communityAddress)
})

export const fetchCommunityUsersEntities = ({ communityAddress }) => client.query({
  query: GET_COMMUNITY_USERS_QUERY(communityAddress)
})

export const fetchCommunityBusinessesEntities = ({ communityAddress }) => client.query({
  query: GET_COMMUNITY_BUSINESSES_QUERY(communityAddress)
})

export const fetchUserWallets = ({ accounts }) => client.query({
  query: FETCH_WALLETS,
  variables: { accounts }
})

export const fetchUserNames = (apiRoot, { accounts }) =>
  request.post(`${apiRoot}/users/getnames`)
    .send({ accounts })
    .then(response => ({ data: response.body.data.map(entity => ({ ...entity, account: entity.accountAddress, address: entity.accountAddress })) }))

export const createEntitiesMetadata = (apiRoot, { communityAddress, accountAddress, metadata }) =>
  request.put(`${apiRoot}/entities/${communityAddress}/${accountAddress}`)
    .send({ metadata })
    .then(response => response.body)

export const fetchEntity = (apiRoot, { communityAddress, account }) =>
  request.get(`${apiRoot}/entities/${communityAddress}/${account}`).then(response => response.body)

export const fetchEntityMetadata = (apiRoot, { communityAddress, account }) =>
  request.get(`${apiRoot}/entities/metadata/${communityAddress}/${account}`).then(response => response.body)

export const fetchCommunities = (apiRoot, { jwtToken }) =>
  request.get(`${apiRoot}/communities/user`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .then(response => response.body)
