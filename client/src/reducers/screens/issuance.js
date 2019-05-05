import {CREATE_TOKEN, CREATE_TOKEN_WITH_METADATA, FETCH_DEPLOY_PROGRESS} from 'actions/token'
import {REQUEST, FAILURE} from 'actions/constants'
import {LOCATION_CHANGE} from 'connected-react-router'
import pick from 'lodash/pick'

const initialState = {
  receipt: null,
  transactionHash: null,
  transactionStatus: null,
  steps: {
    bridge: false,
    membersList: false,
    tokenIssued: false
  }
}

export default (state = initialState, action) => {
  switch (action.type) {
    case CREATE_TOKEN_WITH_METADATA.REQUEST:
      return {...state, transactionStatus: REQUEST, createTokenSignature: true}
    case CREATE_TOKEN_WITH_METADATA.FAILURE:
      return {...state, transactionStatus: FAILURE, createTokenSignature: false}
    case CREATE_TOKEN_WITH_METADATA.SUCCESS:
      return {...state, ...action.response, steps: { ...pick(state.steps, Object.keys(action.response.steps)), tokenIssued: true }}
    case CREATE_TOKEN.REQUEST:
      return {...state, ...action.response}
    case CREATE_TOKEN.PENDING:
      return {...state, ...action.response, createTokenSignature: false}
    case CREATE_TOKEN.FAILURE:
      return {...state, ...action.response, createTokenSignature: false}
    case FETCH_DEPLOY_PROGRESS.SUCCESS:
      return { ...state, ...action.response, steps: { ...state.steps, ...action.response.steps } }
    case LOCATION_CHANGE:
      if (action.payload.location.pathname === '/view/issuance') {
        return {...initialState}
      } else {
        return state
      }
    default:
      return state
  }
}
