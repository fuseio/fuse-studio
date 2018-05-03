
export default (state = {}, action) => {
  if (action.entity === 'basicToken') {
    return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
  }
  return state
}
