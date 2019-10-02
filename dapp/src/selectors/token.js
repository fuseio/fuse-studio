
export const getHomeTokenAddress = (state, tokenAddress) =>
  state.entities.bridges[tokenAddress] && state.entities.bridges[tokenAddress].homeTokenAddress

export const getForeignTokenByCommunityAddress = (state, communityAddress) => {
  const { communities, tokens } = state.entities
  const community = communities[communityAddress]
  if (!community) {
    return null
  }
  return tokens[community.foreignTokenAddress]
}

export const getHomeTokenByCommunityAddress = (state, communityAddress) => {
  const { communities, tokens } = state.entities
  const community = communities[communityAddress]
  if (!community) {
    return null
  }
  return tokens[community.homeTokenAddress]
}