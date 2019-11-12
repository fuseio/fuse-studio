import { all, fork } from 'redux-saga/effects'

import networkSaga from './network'
import metadataSaga from './metadata'
import accountsSaga from './accounts'
import communityEntitiesSaga from './communityEntities'
import tokenSaga from './token'
import userSaga from './user'
import bridgeSaga from './bridge'
import errorSaga from './error'

export default function * rootSaga () {
  yield all([
    fork(metadataSaga),
    fork(networkSaga),
    fork(accountsSaga),
    fork(communityEntitiesSaga),
    fork(tokenSaga),
    fork(userSaga),
    fork(bridgeSaga),
    fork(errorSaga)
  ])
}
