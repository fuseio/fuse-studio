import { all, put } from 'redux-saga/effects'

import {tryTakeEvery} from './utils'
import * as api from 'services/api'
import * as actions from 'actions/metadata'

function * fetchMetadata ({protocol, hash, tokenAddress}) {
  const {data} = yield api.fetchMetadata(protocol, hash)

  if (data.metadata.image) {
    data.metadata.imageLink = api.API_ROOT + '/images/' + data.metadata.image.split('//')[1]
  }

  yield put({
    type: actions.FETCH_METADATA.SUCCESS,
    tokenAddress,
    response: {
      metadata: data.metadata,
      address: tokenAddress
    }
  })
}

export function * createMetadata ({metadata}) {
  const {data} = yield api.createMetadata(metadata)
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
