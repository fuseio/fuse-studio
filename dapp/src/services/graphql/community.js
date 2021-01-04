import { gql } from '@apollo/client'
import { client } from './index'

const GET_COMMUNITY_ADMINS = gql`
query getCommunityAdmins($address: String!) {
  communities(where:{address: $address}) {
    entitiesList {
      communityEntities(where: {isAdmin: true}) {
        address
      }
    }
  }
}
`

const GET_COMMUNITY_USERS = gql`
query fetchCommunityUsers($address: String!) {
  communities(where:{address: $address}) {
    entitiesList {
      communityEntities(where: {isUser: true}) {
        address,
        isUser
        isApproved
        isAdmin
        isBusiness,
        createdAt
      }
    }
  }
}
`

const GET_COMMUNITY_BUSINESSES = gql`
query fetchCommunityBusinesses($address: String!) {
  communities(where:{address: $address}) {
    entitiesList {
      communityEntities(where: {isBusiness: true}) {
        address,
        isUser
        isApproved
        isAdmin
        isBusiness,
        createdAt
      }
    }
  }
}
`

const IS_COMMUNITY_MEMBER = gql`
query getCommunityAdmins($address: String!, $userAddress: String!) {
  communities(where:{address: $address}) {
    entitiesList {
      communityEntities(where: {isUser: true, address: $userAddress}) {
        address
      }
    }
  }
}
`

const FETCH_COMMUNITY_ENTITIES = gql`
query fetchCommunityEntities($communityAddress: String!) {
    communities(where:{address: $communityAddress}) {
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

export const getCommunityAdmins = (address) => client.query({
  query: GET_COMMUNITY_ADMINS,
  variables: { address }
})

export const fetchCommunityUsers = (address) => client.query({
  query: GET_COMMUNITY_USERS,
  variables: { address }
})

export const fetchCommunityBusinesses = (address) => client.query({
  query: GET_COMMUNITY_BUSINESSES,
  variables: { address }
})

export const isCommunityMember = (address, userAddress) => client.query({
  query: IS_COMMUNITY_MEMBER,
  variables: { address, userAddress }
})

export const fetchCommunityEntities = (communityAddress) => client.query({
  query: FETCH_COMMUNITY_ENTITIES,
  variables: { communityAddress }
})
