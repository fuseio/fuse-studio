import merge from 'lodash/merge'

const initialState = {
}

export default (state = initialState, action) => {
  if (action.response && action.response.transactionStatus) {
    const transactionHash = action.response.transactionHash || action.response.receipt.transactionHash
    return merge({}, state, {[transactionHash]: action.response})
  }
  return state
}
