import * as web3 from 'actions/web3'

export default (state = {}, action) => {
  switch (action.type) {
    case web3.GET_NETWORK_TYPE.SUCCESS:
      return {...state, ...action.response}
    default:
      return state
  }
}
