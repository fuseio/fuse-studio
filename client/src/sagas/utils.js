import { put, takeEvery, takeLatest } from 'redux-saga/effects'
import { delay } from 'redux-saga'

export const createEntityPut = (entity) => (action) => put({...action, entity})

export function tryCatch (action, saga) {
  return function * wrappedTryCatch (args) {
    try {
      yield saga(args)
    } catch (error) {
      yield put({
        ...args,
        error,
        type: action.FAILURE
      })
    }
  }
}

export function tryCatchWithDebounce (action, saga, timeout) {
  return function * wrappedTryCatch (args) {
    try {
      yield delay(timeout)
      yield saga(args)
    } catch (error) {
      yield put({
        ...args,
        error,
        type: action.FAILURE
      })
    }
  }
}

export const tryTakeEvery = (action, saga) => takeEvery(action.REQUEST, tryCatch(action, saga))
export const tryTakeLatestWithDebounce = (action, saga, timeout = CONFIG.ui.debounce) =>
  takeLatest(action.REQUEST, tryCatchWithDebounce(action, saga, 500))
