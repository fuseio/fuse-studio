import * as erc20 from 'actions/erc20'

export default (state = {}, action) => {
  switch (action.type) {
    case erc20.BALANCE_OF.SUCCESS:
      return {...state, balance: action.data}
    case erc20.NAME.SUCCESS:
      return {...state, name: action.data}
    default:
      return state
  }
}
