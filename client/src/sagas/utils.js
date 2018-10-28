import { call, put, takeEvery, takeLatest, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import { getApiRoot } from 'selectors/network'

export const createEntityPut = (entity) => (action) => put({...action, entity})

function * tryClause (args, error, action, numberOfTries = CONFIG.api.retryCount) {
  yield put({
    ...args,
    error,
    type: action.FAILURE
  })
  args = {...args, numberOfTries: args.numberOfTries ? args.numberOfTries + 1 : 1}
  if (args.numberOfTries < numberOfTries) {
    yield delay(CONFIG.api.retryTimeout)
    yield put(args)
  }
}

export function tryCatch (action, saga, numberOfTries) {
  return function * wrappedTryCatch (args) {
    try {
      yield saga(args)
    } catch (error) {
      yield tryClause(args, error, action, numberOfTries)
    }
  }
}

export function tryCatchWithDebounce (action, saga, timeout) {
  return function * wrappedTryCatch (args) {
    try {
      yield delay(timeout)
      yield saga(args)
    } catch (error) {
      yield tryClause(args, error, action)
    }
  }
}

export const tryTakeEvery = (action, saga, numberOfTries) => takeEvery(action.REQUEST, tryCatch(action, saga, numberOfTries))
export const tryTakeLatestWithDebounce = (action, saga, timeout = CONFIG.ui.debounce) =>
  takeLatest(action.REQUEST, tryCatchWithDebounce(action, saga, 500))

export function * apiCall (...args) {
  const apiRoot = yield select(getApiRoot)
  return yield call(...args, apiRoot)
}
