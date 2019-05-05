import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import marketMaker from './marketMaker'
import accounts from './accounts'
import ui from './ui'
import network from './network'
import errors from './errors'
import screens from './screens'
import entities from './entities'
import transactions from './transactions'

const createRootReducer = (history) => combineReducers({
  ui,
  screens,
  marketMaker,
  network,
  errors,
  accounts,
  router: connectRouter(history),
  transactions,
  entities
})

export default createRootReducer
