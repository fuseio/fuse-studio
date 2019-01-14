import {CREATE_CURRENCY} from 'actions/issuance'
import {SET_USER_INFORMATION} from 'actions/accounts'
import {ISSUE_COMMUNITY} from 'actions/communities'
import {REQUEST, FAILURE} from 'actions/constants'
import {LOCATION_CHANGE} from 'connected-react-router'

const initialState = {
  receipt: null,
  transactionHash: null,
  transactionStatus: null
}

export default (state = initialState, action) => {
  switch (action.type) {
    case ISSUE_COMMUNITY.REQUEST:
      return {...state, transactionStatus: REQUEST}
    case ISSUE_COMMUNITY.FAILURE:
      return {...state, transactionStatus: FAILURE}
    case CREATE_CURRENCY.PENDING:
      return {...state, ...action.response}
    case CREATE_CURRENCY.SUCCESS:
      return {...state, ...action.response}
    case CREATE_CURRENCY.FAILURE:
      return {...state, ...action.response}
    case SET_USER_INFORMATION.SUCCESS:
      return {...state, transactionStatus: null}
    case LOCATION_CHANGE:
      if (action.payload.pathname === '/') {
        return {...initialState}
      } else {
        return state
      }
    default:
      return state
  }
}
