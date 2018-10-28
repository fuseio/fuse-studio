import { combineReducers } from 'redux'

import communities from './communities'
import marketMaker from './marketMaker'
import accounts from './accounts'
import ui from './ui'
import { routerReducer as router } from 'react-router-redux'
import network from './network'
import errors from './errors'
import fiat from './fiat'
import screens from './screens'
import entities from './entities'

const rootReducer = combineReducers({
  ui,
  screens,
  tokens: communities,
  marketMaker,
  network,
  errors,
  accounts,
  router,
  fiat,
  entities
})

export default rootReducer
