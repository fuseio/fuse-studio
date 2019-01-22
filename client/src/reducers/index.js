import { combineReducers } from 'redux'
import marketMaker from './marketMaker'
import accounts from './accounts'
import ui from './ui'
import { connectRouter } from 'connected-react-router'
import network from './network'
import errors from './errors'
import screens from './screens'
import entities from './entities'

const createRootReducer = (history) => combineReducers({
  ui,
  screens,
  marketMaker,
  network,
  errors,
  accounts,
  router: connectRouter(history),
  entities
})

export default createRootReducer
