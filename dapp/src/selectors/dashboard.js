import { createSelector } from 'reselect'

export const getToken = (state, address) => {
  if (address) {
    const { communities, tokens } = getTokenUtil(state)
    if (communities && tokens) {
      if (communities[address] && communities[address].foreignTokenAddress) {
        return tokens[communities[address].foreignTokenAddress]
      }
    }
  }
}

export const getTokenUtil = createSelector(
  state => state.entities.communities,
  state => state.entities.tokens,
  (communities, tokens) => {
    return { communities, tokens }
  }
)
