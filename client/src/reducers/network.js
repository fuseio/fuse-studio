import * as network from 'actions/network'
import addresses from 'constants/addresses'

export default (state = {addresses}, action) => {
  switch (action.type) {
    case network.CHECK_ACCOUNT_CHANGED.SUCCESS:
      return {...state, ...action.response}
    case network.ACCOUNT_LOGGED_OUT:
      return {...state, ...action.response}
    case network.GET_NETWORK_TYPE.SUCCESS:
      return {...state, ...action.response}
    case network.FETCH_GAS_PRICES.SUCCESS:
      return {...state, ...action.response}
    default:
      return state
  }
}
