import { all, fork } from 'redux-saga/effects'

import communitiesSaga from './communities'
import web3Saga from './network'
import apiSaga from './api'
import marketMakerSaga from './marketMaker'
import subscriptionsSaga from './subscriptions'
import accountsSaga from './accounts'

export default function * rootSaga () {
  yield all([
    fork(communitiesSaga),
    fork(apiSaga),
    fork(web3Saga),
    fork(marketMakerSaga),
    fork(subscriptionsSaga),
    fork(accountsSaga)
  ])
}
