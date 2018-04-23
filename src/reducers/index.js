import { combineReducers } from 'redux'
import erc20Reducer from './basicToken'
import currencyFactory from './currencyFactory'

import { routerReducer } from 'react-router-redux'

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
  currencyFactory,
  router: routerReducer
})

export default rootReducer
