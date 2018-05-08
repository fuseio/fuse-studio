import { all, put, takeEvery } from 'redux-saga/effects'
import web3 from 'services/web3'

import * as actions from 'actions/web3'

export function * getNetworkType () {
  try {
    const networkType = yield web3.eth.net.getNetworkType()
    yield put({type: actions.GET_NETWORK_TYPE.SUCCESS,
      response: {
        networkType
      }})
  } catch (error) {
    yield put({type: actions.GET_NETWORK_TYPE.FAILURE, error})
  }
}

export default function * rootSaga () {
  yield all([
    takeEvery(actions.GET_NETWORK_TYPE.REQUEST, getNetworkType)
  ])
}
