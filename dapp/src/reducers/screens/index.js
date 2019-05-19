import { combineReducers } from 'redux'

import oven from './oven'
import issuance from './issuance'
import dashboard from './dashboard'
import communityEntities from './communityEntities'
import bridge from './bridge'
import token from './token'

const screensReducer = combineReducers({
  bridge,
  oven,
  issuance,
  dashboard,
  communityEntities,
  token
})

export default screensReducer
