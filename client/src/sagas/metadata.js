import { all, put } from 'redux-saga/effects'

import {createEntityPut, tryTakeEvery, apiCall} from './utils'
import * as api from 'services/api/metadata'
import * as actions from 'actions/metadata'
import {DEFAULT_COMMUNITY_METADATA_LOGO} from 'constants/uiConstants'

const entityPut = createEntityPut(actions.entityName)

function * fetchMetadata ({tokenURI}) {
  if (!tokenURI) {
    throw new Error(`No tokenURI given`)
  }

  const [protocol, hash] = tokenURI.split('://')

  const {data} = yield apiCall(api.fetchMetadata, protocol, hash)

  if (data.metadata.image) {
    data.metadata.communityLogo = DEFAULT_COMMUNITY_METADATA_LOGO
  }
  yield entityPut({
    type: actions.FETCH_METADATA.SUCCESS,
    response: {
      entities: {
        [tokenURI]: data.metadata
      }
    }
  })
}

export function * createMetadata ({metadata}) {
  const {data} = yield apiCall(api.createMetadata, metadata)
  yield put({
    type: actions.CREATE_METADATA.SUCCESS,
    response: {
      data
    }
  })
  return data
}

export default function * apiSaga () {
  yield all([
    tryTakeEvery(actions.FETCH_METADATA, fetchMetadata, 1),
    tryTakeEvery(actions.CREATE_METADATA, createMetadata, 1)
  ])
}
