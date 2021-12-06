
import { ApolloClient, InMemoryCache } from '@apollo/client'

export const client = new ApolloClient({
  uri: `${CONFIG.api.graph.subgraphs.entities}`,
  cache: new InMemoryCache()
})
