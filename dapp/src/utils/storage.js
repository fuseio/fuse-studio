
export const loadState = (key) => {
  try {
    const serializedState = window.localStorage.getItem(key)
    if (!serializedState) {
      return null
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return null
  }
}

export const saveState = (key, state) => {
  try {
    const serializedState = JSON.stringify(state)
    window.localStorage.setItem(key, serializedState)
  } catch (err) {
    // ignore write errors
    console.log(err)
  }
}
