import {GET_LIST, CREATE_LIST, FETCH_ENTITIES, ADD_DIRECTORY_ENTITY} from 'actions/directory'
import {REQUEST, SUCCESS, FAILURE} from 'actions/constants'

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
      return {...state, ...action.response, transactionStatus: SUCCESS}
    case FETCH_ENTITIES.SUCCESS:
      return {...state, ...action.response}
    case ADD_DIRECTORY_ENTITY.REQUEST:
      return {...state, transactionStatus: REQUEST}
    case ADD_DIRECTORY_ENTITY.FAILURE:
      return {...state, transactionStatus: FAILURE}
    case ADD_DIRECTORY_ENTITY.SUCCESS:
      return {...state, transactionStatus: SUCCESS}
    default:
      return state
  }
}
