
import { ApolloClient, InMemoryCache } from '@apollo/client'

export const client = new ApolloClient({
  uri: CONFIG.api.graph.url,
  cache: new InMemoryCache()
})
