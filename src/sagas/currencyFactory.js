import { all, put, take, fork } from 'redux-saga/effects'
import {BigNumber} from 'bignumber.js'

import * as actions from 'actions/currencyFactory'
import {ADD_COMMUNITY} from 'actions/api'
import { contract } from 'osseus-wallet'
import web3 from 'services/web3'

const CurrencyFactoryContract = contract.getContract({contractName: 'CurrencyFactory'})

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
      currencyData.tokenURI
    ).send({
      from: web3.eth.defaultAccount
    })

    yield put({type: actions.CREATE_CURRENCY.SUCCESS, data})
    yield put({type: ADD_COMMUNITY.REQUEST,
      community: {
        name: currencyData.name,
        symbol: currencyData.symbol,
        address: data.address
      }})
  } catch (error) {
    console.log(error)
    yield put({type: actions.CREATE_CURRENCY.FAILURE, error})
  }
}

export function * openMarket (address) {
  try {
    const data = yield CurrencyFactoryContract.methods.openMarket(
      address
    ).send({
      from: web3.eth.defaultAccount
    })
    yield put({type: actions.OPEN_MARKET.SUCCESS, data})
  } catch (error) {
    yield put({type: actions.OPEN_MARKET.FAILURE, error})
  }
}

export function * insertCLNtoMarketMaker (address, clnAmount) {
  try {
    const data = yield CurrencyFactoryContract.methods.insertCLNtoMarketMaker(
      address,
      clnAmount
    ).send({
      from: web3.eth.defaultAccount
    })
    yield put({type: actions.INSERT_CLN_TO_MARKET_MAKER.SUCCESS, data})
  } catch (error) {
    yield put({type: actions.INSERT_CLN_TO_MARKET_MAKER.FAILURE, error})
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

export function * watchOpenMarket () {
  while (true) {
    const {address} = yield take(actions.OPEN_MARKET.REQUEST)
    yield fork(openMarket, address)
  }
}

export function * watchCreateCurrency () {
  while (true) {
    const {currencyData} = yield take(actions.CREATE_CURRENCY.REQUEST)
    yield fork(createCurrency, currencyData)
  }
}

export function * watchInsertCLNtoMarketMaker () {
  while (true) {
    const {address, clnAmount} = yield take(actions.INSERT_CLN_TO_MARKET_MAKER.REQUEST)
    yield fork(insertCLNtoMarketMaker, address, clnAmount)
  }
}

export default function * rootSaga () {
  yield all([
    fork(watchSupportsToken),
    fork(watchTokens),
    fork(watchCreateCurrency),
    fork(watchOpenMarket),
    fork(watchInsertCLNtoMarketMaker)
  ])
}
