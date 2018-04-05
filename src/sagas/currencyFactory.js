import { all, put, take, fork } from 'redux-saga/effects'
import {BigNumber} from 'bignumber.js';

import * as actions from 'actions/currencyFactory'
import { contract } from 'osseus-wallet'
import web3 from 'services/web3'

const CurrencyFactoryContract = contract.getContract('CurrencyFactory')

export function * supportsToken (address) {
  try {
    const data = yield CurrencyFactoryContract.methods.supportsToken(address).call()
    yield put({type: actions.SUPPORTS_TOKEN.SUCCESS, data})
  } catch (error) {
    yield put({type: actions.SUPPORTS_TOKEN.FAILURE, error})
  }
}

export function * tokens (index) {
  try {
    const data = yield CurrencyFactoryContract.methods.tokens(index).call()
    yield put({type: actions.TOKENS.SUCCESS, data})
  } catch (error) {
    yield put({type: actions.TOKENS.FAILURE, error})
  }
}

export function * createCurrency (currencyData) {
  try {
    const data = yield CurrencyFactoryContract.methods.createCurrency(
      currencyData.name,
      currencyData.symbol,
      currencyData.decimals,
      new BigNumber(currencyData.totalSupply),
      currencyData.data
    ).send({
      from: web3.eth.defaultAccount
    })
    yield put({type: actions.CREATE_CURRENCY.SUCCESS, data})
  } catch (error) {
    yield put({type: actions.CREATE_CURRENCY.FAILURE, error})
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

export function * watchCreateCurrency () {
  while (true) {
    const {currencyData} = yield take(actions.CREATE_CURRENCY.REQUEST)
    yield fork(createCurrency, currencyData)
  }
}

export default function * rootSaga () {
  yield all([
    fork(watchSupportsToken),
    fork(watchTokens),
    fork(watchCreateCurrency)
  ])
}
