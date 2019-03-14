import * as network from 'actions/network'
const {addresses} = CONFIG.web3

const initialState = {
  addresses,
  homeNetwork: 'fuse',
  foreignNetwork: 'ropsten',
  fuse: {},
  ropsten: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case network.CHECK_ACCOUNT_CHANGED.SUCCESS:
      return {...state, ...action.response}
    case network.ACCOUNT_LOGGED_OUT:
      return {...state, ...action.response}
    case network.GET_NETWORK_TYPE.SUCCESS:
      return {...state, ...action.response}
    case network.FETCH_GAS_PRICES.SUCCESS:
      return {...state, ...action.response}
    case network.GET_BLOCK_NUMBER.SUCCESS:
      return {...state, [action.networkType]: {...state[action.networkType], ...action.response}}
    default:
      return state
  }
}
