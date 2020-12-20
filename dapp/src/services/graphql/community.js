import { gql } from '@apollo/client'
import { client } from './index'

const GET_COMMUNITY_ADMINS = gql`
query getCommunityAdmins($address: String!) {
  communities(where:{address: $address}) {
    name
    entitiesList {
      communityEntities(where: {isAdmin: true}) {
        address
      }
    }
  }
}
`

export const getCommunityAdmins = (address) => client.query({
  query: GET_COMMUNITY_ADMINS,
  variables: { address }
})
