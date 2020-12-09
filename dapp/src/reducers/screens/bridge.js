import omit from 'lodash/omit'
import * as actions from 'actions/bridge'
import { LOCATION_CHANGE } from 'connected-react-router'

const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case actions.GET_TOKEN_ALLOWANCE.REQUEST:
      return { ...state, ...action.response }
    case actions.GET_TOKEN_ALLOWANCE.FAILURE:
      return { ...state }
    case actions.GET_TOKEN_ALLOWANCE.SUCCESS:
      return { ...state, allowance: { ...state.allowance, [action.tokenAddress]: action.response.allowance } }
    case actions.WATCH_FOREIGN_BRIDGE.SUCCESS:
      return { ...state, ...action.response }
    case actions.WATCH_NEW_TOKEN_REGISTERED.SUCCESS:
      return { ...state, ...action.response }
    case actions.WATCH_HOME_BRIDGE.SUCCESS:
      return { ...state, ...action.response }
    case actions.APPROVE_TOKEN.SUCCESS:
      return { ...omit({ ...state, approveSignature: false, approved: { ...state.approved, [action.response.tokenAddress]: true } }, 'transactionHash') }
    case actions.APPROVE_TOKEN.FAILURE:
      return { ...omit({ ...state, approveSignature: false }, 'transactionHash') }
    case actions.APPROVE_TOKEN.PENDING:
      return { ...state, approveSignature: false, transactionHash: action.response.transactionHash }
    case actions.APPROVE_TOKEN.REQUEST:
      return { ...state, approveSignature: true }
    case actions.TRANSFER_TO_HOME.FAILURE:
      return { ...state, bridgeSignature: false }
    case actions.TRANSFER_TO_HOME.REQUEST:
      return { ...state, bridgeSignature: true, confirmationsLimit: action.confirmationsLimit }
    case actions.TRANSFER_TO_HOME.PENDING:
      return { ...state, bridgeSignature: false, transactionHash: action.response.transactionHash }
    case actions.TRANSFER_TO_FOREIGN.FAILURE:
      return { ...state, bridgeSignature: false }
    case actions.TRANSFER_TO_FOREIGN.REQUEST:
      return { ...state, bridgeSignature: true, confirmationsLimit: action.confirmationsLimit }
    case actions.TRANSFER_TO_FOREIGN.PENDING:
      return { ...state, bridgeSignature: false, transactionHash: action.response.transactionHash }
    case LOCATION_CHANGE:
      return initialState
    default:
      return state
  }
}
