import {CREATE_TOKEN, CREATE_TOKEN_WITH_METADATA} from 'actions/token'
import {REQUEST, FAILURE} from 'actions/constants'
import {LOCATION_CHANGE} from 'connected-react-router'

const initialState = {
  receipt: null,
  transactionHash: null,
  transactionStatus: null
}

export default (state = initialState, action) => {
  switch (action.type) {
    case CREATE_TOKEN_WITH_METADATA.REQUEST:
      return {...state, transactionStatus: REQUEST}
    case CREATE_TOKEN_WITH_METADATA.FAILURE:
      return {...state, transactionStatus: FAILURE}
    case CREATE_TOKEN_WITH_METADATA.SUCCESS:
      return {...state, ...action.response}
    case CREATE_TOKEN.PENDING:
      return {...state, ...action.response}
    case CREATE_TOKEN.FAILURE:
      return {...state, ...action.response}
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
