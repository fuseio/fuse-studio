import { all, put, takeEvery } from 'redux-saga/effects'
import {BigNumber} from 'bignumber.js'

import * as actions from 'actions/currencyFactory'
import {ADD_COMMUNITY} from 'actions/api'
import { contract } from 'osseus-wallet'
import web3 from 'services/web3'

const CurrencyFactoryContract = contract.getContract({contractName: 'CurrencyFactory'})

function * supportsToken ({address}) {
  try {
    const data = yield CurrencyFactoryContract.methods.supportsToken(address).call()
    yield put({type: actions.SUPPORTS_TOKEN.SUCCESS, data})
  } catch (error) {
    yield put({type: actions.SUPPORTS_TOKEN.FAILURE, error})
  }
}

function * tokens ({index}) {
  try {
    const data = yield CurrencyFactoryContract.methods.tokens(index).call()
    yield put({type: actions.TOKENS.SUCCESS, data})
  } catch (error) {
    yield put({type: actions.TOKENS.FAILURE, error})
  }
}

function * createCurrency ({currencyData}) {
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

function * openMarket ({address}) {
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

function * insertCLNtoMarketMaker ({address, clnAmount}) {
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

export default function * rootSaga () {
  yield all([
    takeEvery(actions.SUPPORTS_TOKEN.REQUEST, supportsToken),
    takeEvery(actions.TOKENS.REQUEST, tokens),
    takeEvery(actions.CREATE_CURRENCY.REQUEST, createCurrency),
    takeEvery(actions.OPEN_MARKET.REQUEST, openMarket),
    takeEvery(actions.INSERT_CLN_TO_MARKET_MAKER.REQUEST, insertCLNtoMarketMaker)
  ])
}
