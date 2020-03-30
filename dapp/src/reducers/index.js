import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import accounts from './accounts'
import ui from './ui'
import network from './network'
import errors from './errors'
import screens from './screens'
import entities from './entities'
import transactions from './transactions'
import user from './user'

const createRootReducer = (history) => combineReducers({
  ui,
  screens,
  network,
  errors,
  accounts,
  router: connectRouter(history),
  transactions,
  entities,
  user
})

export default createRootReducer
