import { call, put, takeEvery, takeLatest, select, delay } from 'redux-saga/effects'

import { getForeignNetwork } from 'selectors/network'
import { getAccount } from 'selectors/accounts'
import {getApiRoot} from 'utils/network'
import keyBy from 'lodash/keyBy'

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

export function * apiCall (apiFunc, params, options = {}) {
  const networkType = options.networkType ? options.networkType : yield select(getForeignNetwork)
  const apiRoot = getApiRoot(networkType)
  if (options.auth) {
    const {authToken} = yield select(getAccount)
    return yield call(apiFunc, apiRoot, {...params, authToken})
  }
  return yield call(apiFunc, apiRoot, params)
}

const entityKeys = {
  tokens: 'address',
  partners: 'name',
  businesses: 'hash'
}

export const createEntitiesFetch = (action, apiFunc) => function * (params) {
  const entity = params.entity
  if (!entity) {
    throw Error(`No entity name given for action ${action.REQUEST}`)
  }
  const response = yield apiCall(apiFunc, params)
  const {data, ...metadata} = response
  const tokens = data

  const entities = keyBy(tokens, entityKeys[entity])
  const result = Object.keys(entities)

  yield put({
    ...params,
    type: action.SUCCESS,
    response: {
      entities,
      result,
      metadata
    }})

  return tokens
}
