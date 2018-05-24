import { combineReducers } from 'redux'

import basicToken from './basicToken'
import currencyFactory from './currencyFactory'
import ui from './uiReducer'
import { routerReducer } from 'react-router-redux'
import web3 from './web3'
import errors from './errors'

const rootReducer = combineReducers({
  ui,
  tokens: basicToken,
  currencyFactory,
  web3,
  errors,
  router: routerReducer
})

export default rootReducer
