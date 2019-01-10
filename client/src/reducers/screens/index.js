import { combineReducers } from 'redux'

import oven from './oven'
import calculator from './calculator'
import issuance from './issuance'
import dashboard from './dashboard'
import directory from './directory'

const screensReducer = combineReducers({
  oven,
  calculator,
  issuance,
  dashboard,
  directory
})

export default screensReducer
