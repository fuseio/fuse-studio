import { all, put, takeEvery } from 'redux-saga/effects'

import {createEntityPut, tryTakeEvery, apiCall} from './utils'
import * as api from 'services/api/metadata'
import * as actions from 'actions/metadata'
import {FETCH_BUSINESSES} from 'actions/directory'

const entityPut = createEntityPut(actions.entityName)

function * fetchMetadata ({tokenURI}) {
  if (!tokenURI) {
    throw new Error(`No tokenURI given`)
  }

  const hash = tokenURI.split('://')[1]

  const {data} = yield apiCall(api.fetchMetadata, {hash})

  yield entityPut({
    type: actions.FETCH_METADATA.SUCCESS,
    response: {
      entities: {
        [tokenURI]: data
      }
    }
  })
}

export function * createMetadata ({metadata}) {
  const {data, hash} = yield apiCall(api.createMetadata, {metadata})
  yield put({
    type: actions.CREATE_METADATA.SUCCESS,
    response: {
      data,
      hash
    }
  })
  return {data, hash}
}

function * watchTokensFetched ({response}) {
  const {result, entities} = response
  for (let tokenAddress of result) {
    const token = entities[tokenAddress]
    yield put(actions.fetchMetadata(token.tokenURI))
  }
}

function * watchBusinessesFetched ({response}) {
  const {result} = response
  for (let hash of result) {
    const uri = `ipfs://${hash}`
    yield put(actions.fetchMetadata(uri))
  }
}

export default function * apiSaga () {
  yield all([
    tryTakeEvery(actions.FETCH_METADATA, fetchMetadata, 1),
    tryTakeEvery(actions.CREATE_METADATA, createMetadata, 1),
    takeEvery(action => /^FETCH_TOKENS.*SUCCESS/.test(action.type), watchTokensFetched),
    takeEvery(FETCH_BUSINESSES.SUCCESS, watchBusinessesFetched)
  ])
}
