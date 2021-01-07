import * as network from 'actions/network'
import { loadState } from 'utils/storage'
const { addresses } = CONFIG.web3

const loadedState = loadState('state.network') || CONFIG.web3.bridge.network

const initialState = {
  addresses,
  homeNetwork: 'fuse',
  foreignNetwork: 'ropsten',
  fuse: {},
  ropsten: {},
  ...loadedState
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'LOGOUT':
      return initialState
    case network.CONNECT_TO_WALLET.REQUEST:
      return { ...state, connectingToWallet: true }
    case network.CONNECT_TO_WALLET.SUCCESS:
      return { ...state, connectingToWallet: false }
    case network.CONNECT_TO_WALLET.FAILURE:
      return { ...state, connectingToWallet: false }
    case network.CHECK_ACCOUNT_CHANGED.SUCCESS:
      return { ...state, ...action.response }
    case network.ACCOUNT_LOGGED_OUT:
      return { ...state, ...action.response }
    case network.CHECK_NETWORK_TYPE.SUCCESS:
      return { ...state, ...action.response }
    case network.GET_BLOCK_NUMBER.SUCCESS:
      return { ...state, [action.networkType]: { ...state[action.networkType], ...action.response } }
    default:
      return state
  }
}
