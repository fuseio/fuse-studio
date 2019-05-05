const initialState = {
  actions: []
}

export default (state = initialState, action) => {
  if (action.error) {
    return { ...state, actions: [...state.actions, action] }
  } else {
    return state
  }
}
