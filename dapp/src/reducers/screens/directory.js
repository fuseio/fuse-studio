import union from 'lodash/union'
import { GET_LIST, CREATE_LIST, FETCH_BUSINESSES, ADD_ENTITY, EDIT_ENTITY } from 'actions/directory'
import { REQUEST, SUCCESS } from 'actions/constants'
import { LOCATION_CHANGE } from 'connected-react-router'

const initialState = {
  listHashes: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_LIST.SUCCESS:
      return { ...state, ...action.response }
    case CREATE_LIST.REQUEST:
      return { ...state, transactionStatus: REQUEST }
    case CREATE_LIST.SUCCESS:
      return { ...state, ...action.response, transactionStatus: SUCCESS }
    case FETCH_BUSINESSES.SUCCESS:
      return { ...state,
        listHashes: union(state.listHashes, action.response.result),
        hasMore: action.response.metadata.has_more }
    case ADD_ENTITY.REQUEST:
      return { ...state, signatureNeeded: true }
    case ADD_ENTITY.PENDING:
      return { ...state, transactionHash: action.response.transactionHash, signatureNeeded: false }
    case EDIT_ENTITY.PENDING:
      return { ...state, editTransactionHash: action.response.transactionHash }
    case LOCATION_CHANGE:
      if (action.payload.location.pathname === '/') {
        return initialState
      } else {
        return state
      }
    default:
      return state
  }
}
