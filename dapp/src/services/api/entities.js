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
      wallets(where: {address_in: $accounts}) {
        address,
        owner
      }
    }
  `

export const fetchCommunityEntities = ({ communityAddress }) => client.query({
  query: GET_COMMUNITY(communityAddress)
})

export const fetchUserWallets = ({ accounts }) => client.query({
  query: FETCH_WALLETS,
  variables: { accounts }
})
export const createEntitiesMetadata = (apiRoot, { communityAddress, accountAddress, metadata }) =>
  request.put(`${apiRoot}/entities/${communityAddress}/${accountAddress}`)
    .send({ metadata })
    .then(response => response.body)

export const fetchEntity = (apiRoot, { communityAddress, account }) =>
  request.get(`${apiRoot}/entities/${communityAddress}/${account}`).then(response => response.body)

export const fetchEntityMetadata = (apiRoot, { communityAddress, account }) =>
  request.get(`${apiRoot}/entities/metadata/${communityAddress}/${account}`).then(response => response.body)

export const fetchCommunities = (apiRoot, { accountAddress }) =>
  request.get(`${apiRoot}/communities/account/${accountAddress}`).then(response => response.body)
