import { put, takeEvery } from 'redux-saga/effects'

export const createEntityPut = (entity) => (action) => put({...action, entity})

export function tryCatch (saga, action) {
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

export const takeEveryWithCatch = (action, saga) => takeEvery(action.REQUEST, tryCatch(saga, action))
