import { takeEvery, all, put, take, fork } from 'redux-saga/effects'

import * as actions from 'actions/currencyFactory'
import { getContract } from 'services/web3/contracts'

const CurrencyFactoryContract = getContract('CurrencyFactory')

export function * supportsToken (address) {
  try {
    const data = yield CurrencyFactoryContract.methods.supportsToken(address).call()
    yield put({type: actions.SUPPORTS_TOKEN.SUCCESS, data})
  } catch (error) {
    yield put({type: actions.SUPPORTS_TOKEN.ERROR, error})
  }
}

export function * tokens (index) {
  try {
    console.log('fsdfsdd')
    const data = yield CurrencyFactoryContract.methods.tokens(index).call()
    console.log(data)
    yield put({type: actions.TOKENS.SUCCESS, data})
  } catch (error) {
    yield put({type: actions.TOKENS.ERROR, error})
  }
}

export function * watchSupportsToken () {
  while (true) {
    const {address} = yield take(actions.SUPPORTS_TOKEN.REQUEST)
    yield fork(supportsToken, address)
  }
}

export function * watchTokens () {
  while (true) {
    const {index} = yield take(actions.TOKENS.REQUEST)
    yield fork(tokens, index)
  }
}

export default function * rootSaga () {
  yield all([
    fork(watchSupportsToken),
    fork(watchTokens)
  ])
}
