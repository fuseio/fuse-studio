import { combineReducers } from 'redux'

import oven from './oven'
import calculator from './calculator'

const screensReducer = combineReducers({
  oven,
  calculator
})

export default screensReducer
