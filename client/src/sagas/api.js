import { all, takeEvery, put } from 'redux-saga/effects'

import * as api from 'services/api'
import * as actions from 'actions/api'

function * fetchMetadata ({protocol, hash, tokenAddress}) {
  const {data} = yield api.fetchMetadata(protocol, hash)
  data.metadata.imageLink = api.API_ROOT + '/images/' + data.metadata.image.split('//')[1]

  yield put({
    type: actions.FETCH_METADATA.SUCCESS,
    tokenAddress,
    response: {
      metadata: data.metadata,
      address: tokenAddress
    }
  })
}

export default function * apiSaga () {
  yield all([
    takeEvery(actions.FETCH_METADATA.REQUEST, fetchMetadata)
  ])
}
