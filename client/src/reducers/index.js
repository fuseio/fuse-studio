import { combineReducers } from 'redux'

import basicToken from './basicToken'
import marketMaker from './marketMaker'
import accounts from './accounts'
import ui from './uiReducer'
import { routerReducer } from 'react-router-redux'
import web3 from './web3'
import errors from './errors'

const rootReducer = combineReducers({
  ui,
  tokens: basicToken,
  marketMaker,
  web3,
  errors,
  accounts,
  router: routerReducer
})

export default rootReducer
