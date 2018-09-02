import { all, fork } from 'redux-saga/effects'

import communitiesSaga from './communities'
import web3Saga from './network'
import metadataSaga from './metadata'
import marketMakerSaga from './marketMaker'
import subscriptionsSaga from './subscriptions'
import accountsSaga from './accounts'
import issuanceSaga from './issuance'
import fiatSaga from './fiat'

export default function * rootSaga () {
  yield all([
    fork(communitiesSaga),
    fork(metadataSaga),
    fork(web3Saga),
    fork(marketMakerSaga),
    fork(subscriptionsSaga),
    fork(accountsSaga),
    fork(issuanceSaga),
    fork(fiatSaga)
  ])
}
