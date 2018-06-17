import { all, takeEvery, put } from 'redux-saga/effects'

import * as api from 'services/api'
import * as actions from 'actions/api'

export function * fetchMetadata ({protocol, hash, contractAddress}) {
  const {data} = yield api.fetchMetadata(protocol, hash)
  data.metadata.imageLink = api.API_ROOT + '/images/' + data.metadata.image.split('//')[1]

  yield put({
    type: actions.FETCH_METADATA.SUCCESS,
    contractAddress,
    response: {
      metadata: data.metadata
    }
  })
}

export default function * rootSaga () {
  yield all([
    takeEvery(actions.FETCH_METADATA.REQUEST, fetchMetadata)
  ])
}
