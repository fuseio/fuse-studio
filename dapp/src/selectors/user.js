import { createSelector } from 'reselect'

export const getJwtToken = createSelector(
  state => state.user.jwtToken,
  (jwtToken) => jwtToken
)
