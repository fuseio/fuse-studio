import { takeEvery, put, all, take, call, fork } from 'redux-saga/effects'
import * as actions from 'actions'

import erc20Saga from './erc20'
import { getContract } from 'services/web3/contracts'
import web3 from 'services/web3/web3'

const currencyFactoryContract = getContract('CurrencyFactory')

export function * fetchSupportsToken (tokenAddress) {
  try {
    // const {tokenAddress} = yield take(actions.FETCH_SUPPORTS_TOKEN_REQUESTED)
    // console.log(tokenAddress)
    const data = yield currencyFactoryContract.methods.supportsToken(tokenAddress).call()
    yield put({type: 'FETCH_SUPPORTS_TOKEN_SUCCEEDED', data})
  } catch (error) {
    yield put({type: 'FETCH_SUPPORTS_TOKEN_FAILED', error})
  }
}

export function * getNetwork () {
  try {
    const data = yield web3.eth.net.getId()
    yield put({type: 'GET_NETWORK_SUCCEEDED', data})
  } catch (error) {
    yield put({type: 'GET_NETWORK_FAILED', error})
  }
}

export function * watchSupportsToken () {
  const { tokenAddress } = yield take(actions.FETCH_SUPPORTS_TOKEN_REQUESTED)
  yield call(fetchSupportsToken, tokenAddress)
}

export function * watchGetNetwork () {
  yield takeEvery(actions.GET_NETWORK, getNetwork)
}

export default function * rootSaga () {
  yield all([
    fork(watchSupportsToken),
    fork(watchGetNetwork),
    fork(erc20Saga)
  ])
}
