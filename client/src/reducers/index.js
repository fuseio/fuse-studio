import { combineReducers } from 'redux'
import communities from './communities'
import marketMaker from './marketMaker'
import accounts from './accounts'
import ui from './ui'
import { connectRouter } from 'connected-react-router'
import network from './network'
import errors from './errors'
import fiat from './fiat'
import screens from './screens'
import entities from './entities'

const createRootReducer = (history) => combineReducers({
  ui,
  screens,
  tokens: communities,
  marketMaker,
  network,
  errors,
  accounts,
  router: connectRouter(history),
  fiat,
  entities
})

export default createRootReducer
