import {FETCH_HOME_TOKEN, FETCH_HOME_BRIDGE, FETCH_FOREIGN_BRIDGE, DEPLOY_BRIDGE, TRANSFER_TO_HOME, TRANSFER_TO_FOREIGN} from 'actions/bridge'
import {LOCATION_CHANGE} from 'connected-react-router'

const initialState = {}
export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_HOME_TOKEN.SUCCESS:
      return {...state, ...action.response}
    case FETCH_HOME_BRIDGE.SUCCESS:
      return {...state, ...action.response}
    case FETCH_FOREIGN_BRIDGE.SUCCESS:
      return {...state, ...action.response}
    case DEPLOY_BRIDGE.SUCCESS:
      return {...state, ...action.response, bridgeDeploying: false}
    case DEPLOY_BRIDGE.REQUEST:
      return {...state, bridgeDeploying: true}
    case TRANSFER_TO_HOME.CONFIRMATION:
      return {...state, ...action.response}
    case TRANSFER_TO_FOREIGN.CONFIRMATION:
      return {...state, ...action.response}
    case TRANSFER_TO_HOME.PENDING:
      return {...state, ...action.response}
    case TRANSFER_TO_FOREIGN.PENDING:
      return {...state, ...action.response}
    case TRANSFER_TO_HOME.REQUEST:
      return {...state, confirmationsLimit: action.confirmationsLimit}
    case TRANSFER_TO_FOREIGN.REQUEST:
      return {...state, confirmationsLimit: action.confirmationsLimit}
    case LOCATION_CHANGE:
      return initialState
    default:
      return state
  }
}
