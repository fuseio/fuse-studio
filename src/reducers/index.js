import { combineReducers } from 'redux'
import basicToken from './basicToken'
import currencyFactory from './currencyFactory'
import ui from './uiReducer'

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
  ui,
  web3,
  tokens: basicToken,
  currencyFactory,
  router: routerReducer
})

export default rootReducer
