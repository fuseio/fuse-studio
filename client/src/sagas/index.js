import { all, fork } from 'redux-saga/effects'

import basicTokenSaga from './basicToken'
import web3Saga from './web3'
import apiSaga from './api'
import marketMakerSaga from './marketMaker'

export default function * rootSaga () {
  yield all([
    fork(basicTokenSaga),
    fork(apiSaga),
    fork(web3Saga),
    fork(marketMakerSaga)
  ])
}
