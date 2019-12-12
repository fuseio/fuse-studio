import * as actions from 'actions/bridge'
import { LOCATION_CHANGE } from 'connected-react-router'

const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case actions.WATCH_FOREIGN_BRIDGE.SUCCESS:
      return { ...state, ...action.response }
    case actions.WATCH_HOME_BRIDGE.SUCCESS:
      return { ...state, ...action.response }
    case actions.WATCH_COMMUNITY_DATA.SUCCESS:
      return { ...state, ...action.response }
    case actions.TRANSFER_TO_FOREIGN.FAILURE:
      return { ...state, bridgeSignature: false }
    case actions.TRANSFER_TO_HOME.FAILURE:
      return { ...state, bridgeSignature: false }
    case actions.TRANSFER_TO_HOME.REQUEST:
      return { ...state, bridgeSignature: true, confirmationsLimit: action.confirmationsLimit }
    case actions.TRANSFER_TO_FOREIGN.REQUEST:
      return { ...state, bridgeSignature: true, confirmationsLimit: action.confirmationsLimit }
    case actions.TRANSFER_TO_HOME.PENDING:
      return { ...state, bridgeSignature: false, transactionHash: action.response.transactionHash }
    case actions.TRANSFER_TO_FOREIGN.PENDING:
      return { ...state, bridgeSignature: false, transactionHash: action.response.transactionHash }
    case LOCATION_CHANGE:
      return initialState
    default:
      return state
  }
}
