import { combineReducers } from 'redux'

import oven from './oven'
import issuance from './issuance'
import dashboard from './dashboard'
import directory from './directory'
import bridge from './bridge'
import token from './token'

const screensReducer = combineReducers({
  bridge,
  oven,
  issuance,
  dashboard,
  directory,
  token
})

export default screensReducer
