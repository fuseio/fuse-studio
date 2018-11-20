import { combineReducers } from 'redux'

import oven from './oven'
import calculator from './calculator'
import issuance from './issuance'

const screensReducer = combineReducers({
  oven,
  calculator,
  issuance
})

export default screensReducer
