import { all, fork } from 'redux-saga/effects'

import networkSaga from './network'
import metadataSaga from './metadata'
import accountsSaga from './accounts'
import directorySaga from './directory'
import tokenSaga from './token'
import partnerSaga from './partner'
import authSaga from './auth'

export default function * rootSaga () {
  yield all([
    fork(metadataSaga),
    fork(networkSaga),
    fork(accountsSaga),
    fork(directorySaga),
    fork(tokenSaga),
    fork(partnerSaga),
    fork(authSaga)
  ])
}
