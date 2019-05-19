import { all, put, takeEvery } from 'redux-saga/effects'

import { createEntityPut, tryTakeEvery, apiCall } from './utils'
import * as entitiesApi from 'services/api/entities'
import * as metadataApi from 'services/api/metadata'
import * as actions from 'actions/metadata'
import { FETCH_TOKEN } from 'actions/token'

const entityPut = createEntityPut(actions.entityName)

function * fetchMetadata ({ tokenURI }) {
  if (!tokenURI) {
    throw new Error(`No tokenURI given`)
  }

  const hash = tokenURI.split('://')[1]

  const { data } = yield apiCall(metadataApi.fetchMetadata, { hash })

  yield entityPut({
    type: actions.FETCH_METADATA.SUCCESS,
    response: {
      entities: {
        [tokenURI]: data
      }
    }
  })
}

export function * createMetadata ({ metadata }) {
  const { data, hash } = yield apiCall(metadataApi.createMetadata, { metadata })
  yield put({
    type: actions.CREATE_METADATA.SUCCESS,
    response: {
      data
    }
  })
  return { data, hash }
}

export function * createEntitiesMetadata ({ communityAddress, accountId, metadata }) {
  const { data, hash } = yield apiCall(entitiesApi.createEntitiesMetadata, { communityAddress, accountId, metadata })
  yield put({
    type: actions.CREATE_METADATA.SUCCESS,
    response: {
      data
    }
  })
  return { data, hash }
}

function * watchTokensFetched ({ response }) {
  const { result, entities } = response
  for (let tokenAddress of result) {
    const token = entities[tokenAddress]
    yield put(actions.fetchMetadata(token.tokenURI))
  }
}

function * watchEntitesFetched ({ response }) {
  const { result, entities } = response
  for (let account of result) {
    const entity = entities[account]
    yield put(actions.fetchMetadata(entity.uri))
  }
}

export default function * apiSaga () {
  yield all([
    tryTakeEvery(actions.FETCH_METADATA, fetchMetadata, 1),
    tryTakeEvery(actions.CREATE_METADATA, createMetadata, 1),
    takeEvery(action => /^FETCH_TOKENS.*SUCCESS/.test(action.type), watchTokensFetched),
    takeEvery(action => /^(FETCH_BUSINESS|FETCH_USER|FETCH_ENTITY).*SUCCESS/.test(action.type), watchEntitesFetched),
    takeEvery(FETCH_TOKEN.SUCCESS, watchTokensFetched)
  ])
}
