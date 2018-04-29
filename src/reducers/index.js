import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import basicToken from './basicToken'
import currencyFactory from './currencyFactory'
import web3 from './web3'

const rootReducer = combineReducers({
  tokens: basicToken,
  currencyFactory,
  web3,
  router: routerReducer
})

export default rootReducer
