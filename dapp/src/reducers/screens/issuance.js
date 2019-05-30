import {
  CREATE_TOKEN,
  CREATE_TOKEN_WITH_METADATA,
  FETCH_DEPLOY_PROGRESS,
  DEPLOY_EXISTING_TOKEN,
  DEPLOY_TOKEN
} from 'actions/token'
import { REQUEST, FAILURE, PENDING } from 'actions/constants'
import { LOCATION_CHANGE } from 'connected-react-router'
import pick from 'lodash/pick'

const initialState = {
  receipt: null,
  transactionHash: null,
  transactionStatus: null,
  steps: {
    tokenIssued: false,
    community: false,
    bridge: false,
    transferOwnership: false
  }
}

export default (state = initialState, action) => {
  switch (action.type) {
    case DEPLOY_TOKEN.SUCCESS:
      return {
        ...state,
        deployResponse: { ...action.response },
        transactionStatus: PENDING,
        steps: { ...state.steps, tokenIssued: true },
        communityAddress: action.communityAddress
      }
    case DEPLOY_EXISTING_TOKEN.REQUEST:
      return { ...state, transactionStatus: REQUEST, tokenIssued: true }
    case DEPLOY_EXISTING_TOKEN.SUCCESS:
      return { ...state, transactionStatus: 'SUCCESS' }
    case CREATE_TOKEN_WITH_METADATA.REQUEST:
      return { ...state, transactionStatus: REQUEST, createTokenSignature: true }
    case CREATE_TOKEN_WITH_METADATA.FAILURE:
      return { ...state, transactionStatus: FAILURE, createTokenSignature: false }
    case CREATE_TOKEN_WITH_METADATA.SUCCESS:
      return { ...state, ...action.response, steps: { ...pick(state.steps, Object.keys(action.response.steps)), tokenIssued: true } }
    case CREATE_TOKEN.REQUEST:
      return { ...state, ...action.response }
    case CREATE_TOKEN.PENDING:
      return { ...state, ...action.response, createTokenSignature: false }
    case CREATE_TOKEN.FAILURE:
      return { ...state, ...action.response, createTokenSignature: false }
    case FETCH_DEPLOY_PROGRESS.SUCCESS:
      return { ...state, ...action.response, steps: { ...state.steps, ...action.response.steps }, communityAddress: action.communityAddress }
    case LOCATION_CHANGE:
      if (action.payload.location.pathname === '/view/issuance') {
        return { ...initialState }
      } else {
        return state
      }
    default:
      return state
  }
}
