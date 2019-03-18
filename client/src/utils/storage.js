
export const loadState = (key, defaulObj) => {
  try {
    const serializedState = window.localStorage.getItem(key)
    if (serializedState === null) {
      return defaulObj
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return defaulObj
  }
}

export const saveState = (key, state) => {
  try {
    const serializedState = JSON.stringify(state)
    window.localStorage.setItem(key, serializedState)
  } catch (err) {
    // ignore write errors
  }
}
