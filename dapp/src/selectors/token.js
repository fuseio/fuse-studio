
export const getHomeTokenAddress = (state, tokenAddress) =>
  state.entities.bridges[tokenAddress] && state.entities.bridges[tokenAddress].homeTokenAddress
