import * as network from 'actions/network'
import { SIGN_IN, CREATE_3BOX_PROFILE } from 'actions/accounts'
import { loadState } from 'utils/storage'
import omit from 'lodash/omit'
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
    case network.FETCH_GAS_PRICES.SUCCESS:
      return { ...state, ...action.response }
    case network.GET_BLOCK_NUMBER.SUCCESS:
      return { ...state, [action.networkType]: { ...state[action.networkType], ...action.response } }
    case SIGN_IN.SUCCESS:
      return { ...state, ...omit(action.response, ['publicData', 'privateData']) }
    case CREATE_3BOX_PROFILE.SUCCESS:
      return { ...state, ...action.response }
    default:
      return state
  }
}
