
import { REHYDRATE } from 'redux-persist/lib/constants'
import * as user from 'actions/user'
import get from 'lodash/get'

export default (state = {}, action) => {
  switch (action.type) {
    case user.LOGIN.SUCCESS:
      return { ...state, ...action.response }
    case 'LOGOUT':
      return {}
    case user.GET_USER_ACCOUNTS.SUCCESS:
      return { ...state, ...action.response }
    case REHYDRATE:
      return { ...state, ...get(action, 'payload.user') }
  }
  return state
}
