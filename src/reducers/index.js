import { combineReducers } from 'redux'
import erc20Reducer from './erc20'
import currencyFactory from './currencyFactory'

function web3 (state = {}, action) {
  switch (action.type) {
    case 'FETCH_SUPPORTS_TOKEN_SUCCEEDED':
      return {...state, supportsToken: action.data}
    case 'GET_NETWORK_SUCCEEDED':
      return {...state, networkType: action.data}
    default:
      return state
  }
}

const rootReducer = combineReducers({
  web3,
  basicToken: erc20Reducer,
  currencyFactory
})

export default rootReducer
