import { combineReducers } from 'redux'

import communities from './communities'
import marketMaker from './marketMaker'
import accounts from './accounts'
import ui from './ui'
import { routerReducer } from 'react-router-redux'
import network from './network'
import errors from './errors'

const rootReducer = combineReducers({
  ui,
  tokens: communities,
  marketMaker,
  network,
  errors,
  accounts,
  router: routerReducer
})

export default rootReducer
