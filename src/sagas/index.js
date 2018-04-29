import { all, fork } from 'redux-saga/effects'

import basicTokenSaga from './basicToken'
import currencyFactorySaga from './currencyFactory'
import web3Saga from './web3'

export default function * rootSaga () {
  yield all([
    fork(basicTokenSaga),
    fork(currencyFactorySaga),
    fork(web3Saga)
  ])
}
