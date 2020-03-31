import * as user from 'actions/user'
import { loadState } from 'utils/storage'

const loadedState = loadState('state.user')

const initialState = {
  isAuthenticated: false,
  ...loadedState
}

export default (state = initialState, action) => {
  switch (action.type) {
    case user.LOGIN.SUCCESS:
      return { ...state, ...action.response }
  }
  return state
}
