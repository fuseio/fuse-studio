import {GET_LIST, CREATE_LIST, FETCH_BUSINESSES, ADD_ENTITY, EDIT_ENTITY} from 'actions/directory'
import {REQUEST, SUCCESS, FAILURE} from 'actions/constants'
import union from 'lodash/union'

const initialState = {
  listHashes: [],
  transactionStatus: null
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_LIST.SUCCESS:
      return {...state, ...action.response}
    case CREATE_LIST.REQUEST:
      return {...state, transactionStatus: REQUEST}
    case CREATE_LIST.SUCCESS:
      return {...state, transactionStatus: SUCCESS}
    case FETCH_BUSINESSES.SUCCESS:
      return {...state,
        listHashes: union(state.listHashes, action.response.result),
        hasMore: action.response.metadata.has_more}
    case ADD_ENTITY.REQUEST:
      return {...state, transactionStatus: REQUEST}
    case ADD_ENTITY.FAILURE:
      return {...state, transactionStatus: FAILURE}
    case ADD_ENTITY.SUCCESS:
      return {...state, transactionStatus: SUCCESS}
    case EDIT_ENTITY.SUCCESS:
      return {...state, editEntityReceipt: action.response.receipt}
    default:
      return state
  }
}
