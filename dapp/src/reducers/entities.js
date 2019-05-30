import merge from 'lodash/merge'
import { entityKeys } from 'sagas/utils'

const initialState = {
  metadata: {},
  tokens: {},
  businesses: {},
  bridges: {},
  communityEntities: {},
  communities: {}
}

export default (state = initialState, action) => {
  if (action.entity && action.response) {
    if (action.response.entities) {
      return merge({}, state, { [action.entity]: action.response.entities })
    }
    const keyName = entityKeys[action.entity]
    const key = action.response[keyName]
    if (key) {
      const obj = {
        [key]: action.response
      }
      return merge({}, state, { [action.entity]: obj })
    } else {
      console.error(`Bad action ${action.type} receieved`)
    }
  }
  return state
}
