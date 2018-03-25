import { combineReducers } from 'redux'
import erc20Reducer from './erc20'

function contract (state = {}, action) {
  switch (action.type) {
    case 'FETCH_SUPPORTS_TOKEN_SUCCEEDED':
      return {...state, supportsToken: action.data}
    case 'GET_NETWORK_SUCCEEDED':
      return {...state, netId: action.data}
    default:
      return state
  }
}

const rootReducer = combineReducers({
  contract,
  basicToken: erc20Reducer
})

export default rootReducer
