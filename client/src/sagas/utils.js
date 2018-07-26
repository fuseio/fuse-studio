import { put, takeEvery, takeLatest } from 'redux-saga/effects'
import { delay } from 'redux-saga'

export const createEntityPut = (entity) => (action) => put({...action, entity})

function * tryClause (args, error, action) {
  yield put({
    ...args,
    error,
    type: action.FAILURE
  })
  args = {...args, numberOfTries: args.numberOfTries ? args.numberOfTries + 1 : 1}
  if (args.numberOfTries < CONFIG.api.retryCount) {
    yield delay(CONFIG.api.retryTimeout)
    yield put(args)
  }
}

export function tryCatch (action, saga) {
  return function * wrappedTryCatch (args) {
    try {
      yield saga(args)
    } catch (error) {
      yield tryClause(args, error, action)
    }
  }
}

export function tryCatchWithDebounce (action, saga, timeout) {
  return function * wrappedTryCatch (args) {
    try {
      yield delay(timeout)
      yield saga(args)
    } catch (error) {
      tryClause(args, error, action)
    }
  }
}

export const tryTakeEvery = (action, saga) => takeEvery(action.REQUEST, tryCatch(action, saga))
export const tryTakeLatestWithDebounce = (action, saga, timeout = CONFIG.ui.debounce) =>
  takeLatest(action.REQUEST, tryCatchWithDebounce(action, saga, 500))
