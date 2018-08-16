import { combineReducers } from 'redux'

import basicToken from './basicToken'
import marketMaker from './marketMaker'
import accounts from './accounts'
import ui from './ui'
import { routerReducer } from 'react-router-redux'
import network from './network'
import errors from './errors'

const rootReducer = combineReducers({
  ui,
  tokens: basicToken,
  marketMaker,
  network,
  errors,
  accounts,
  router: routerReducer
})

export default rootReducer
