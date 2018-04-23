import * as basicToken from 'actions/basicToken'

export default (state = {}, action) => {
  switch (action.type) {
    case basicToken.BALANCE_OF.SUCCESS:
      return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
    case basicToken.NAME.SUCCESS:
      return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
    case basicToken.SYMBOL.SUCCESS:
      return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
    case basicToken.TOTAL_SUPPLY.SUCCESS:
      return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
    case basicToken.METADATA.SUCCESS:
      return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
    case basicToken.SET_METADATA.SUCCESS:
      return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
    case basicToken.OWNER.SUCCESS:
      return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
    default:
      return state
  }
}
