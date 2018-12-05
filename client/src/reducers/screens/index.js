import { combineReducers } from 'redux'

import oven from './oven'
import calculator from './calculator'
import issuance from './issuance'
import dashboard from './dashboard'

const screensReducer = combineReducers({
  oven,
  calculator,
  issuance,
  dashboard
})

export default screensReducer
