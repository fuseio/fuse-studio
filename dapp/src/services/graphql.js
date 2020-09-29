
import { ApolloClient, InMemoryCache } from '@apollo/client'

export const client = new ApolloClient({
  uri: `${CONFIG.api.graph.url}${CONFIG.api.graph.subgraphs['entities']}`,
  cache: new InMemoryCache()
})

export const boxClient = new ApolloClient({
  uri: 'https://api.3box.io/graph',
  cache: new InMemoryCache()
})
