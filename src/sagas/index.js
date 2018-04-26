import { takeEvery, put, all, fork } from 'redux-saga/effects'
import * as actions from 'actions'

import basicTokenSaga from './basicToken'
import currencyFactorySaga from './currencyFactory'
import ipfsSaga from './ipfs'

import web3 from 'services/web3'

export function * getNetwork () {
  try {
    const data = yield web3.eth.net.getNetworkType()
    yield put({type: 'GET_NETWORK_SUCCEEDED', data})
  } catch (error) {
    yield put({type: 'GET_NETWORK_FAILED', error})
  }
}

export function * watchGetNetwork () {
  yield takeEvery(actions.GET_NETWORK, getNetwork)
}

export default function * rootSaga () {
  yield all([
    fork(watchGetNetwork),
    fork(basicTokenSaga),
    fork(currencyFactorySaga),
    fork(ipfsSaga)
  ])
}
