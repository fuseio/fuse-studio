import * as basicToken from 'actions/basicToken'

export default (state = {}, action) => {
  switch (action.type) {
    case basicToken.BALANCE_OF.SUCCESS:
      return {...state, balance: action.data}
    case basicToken.NAME.SUCCESS:
      return {...state, name: action.data}
    default:
      return state
  }
}
