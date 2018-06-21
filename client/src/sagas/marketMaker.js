import { all, call, put, takeEvery, select } from 'redux-saga/effects'
import {BigNumber} from 'bignumber.js'
import { contract } from 'osseus-wallet'

import * as actions from 'actions/marketMaker'
import {BALANCE_OF} from 'actions/basicToken'
import {getClnToken, getCommunity} from 'selectors/basicToken'
import web3 from 'services/web3'

export function * getCurrentPrice ({address, contractAddress}) {
  try {
    const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address})
    const currentPrice = yield call(EllipseMarketMakerContract.methods.getCurrentPrice().call)
    yield put({type: actions.GET_CURRENT_PRICE.SUCCESS,
      contractAddress,
      response: {
        currentPrice: 1 / currentPrice
      }})
  } catch (error) {
    // no CLN inserted to the contract, so the CC has to value at all
    if (error.message === 'Couldn\'t decode uint256 from ABI: 0x') {
      yield put({type: actions.GET_CURRENT_PRICE.SUCCESS,
        contractAddress,
        response: {
          currentPrice: 0
        }})
    } else {
      yield put({type: actions.GET_CURRENT_PRICE.FAILURE, error})
    }
  }
}

export function * clnReserve ({address, contractAddress}) {
  try {
    const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address})
    const clnReserve = yield call(EllipseMarketMakerContract.methods.R1().call)
    yield put({type: actions.CLN_RESERVE.SUCCESS,
      contractAddress,
      response: {
        clnReserve
      }})
  } catch (error) {
    yield put({type: actions.CLN_RESERVE.FAILURE, error})
  }
}

export function * ccReserve ({address, contractAddress}) {
  try {
    const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address})
    const ccReserve = yield call(EllipseMarketMakerContract.methods.R2().call)
    yield put({type: actions.CC_RESERVE.SUCCESS,
      contractAddress,
      response: {
        ccReserve
      }})
  } catch (error) {
    yield put({type: actions.CC_RESERVE.FAILURE, error})
  }
}

export function * quote ({fromToken, inAmount, toToken}) {
  try {
    const clnToken = yield select(getClnToken)
    const ccAddress = clnToken.address === fromToken ? toToken : fromToken

    const token = yield select(getCommunity, ccAddress)

    const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address: token.mmAddress})
    let outAmount = yield call(EllipseMarketMakerContract.methods.quote(fromToken, inAmount, toToken).call)

    if (toToken === ccAddress) {
      const ccReserve = yield call(EllipseMarketMakerContract.methods.calcReserve(
        new BigNumber(token.clnReserve).plus(outAmount), clnToken.totalSupply, token.totalSupply).call)
      outAmount = new BigNumber(token.ccReserve).minus(ccReserve).toString()
    }

    yield put({type: actions.QUOTE.SUCCESS,
      address: token.address,
      response: {
        quotePair: {
          fromToken,
          toToken,
          inAmount,
          outAmount
        }
      }})
  } catch (error) {
    yield put({type: actions.QUOTE.FAILURE, error})
  }
}

export function * change ({fromToken, inAmount, toToken}) {
  try {
    const clnToken = yield select(getClnToken)
    let token = yield select(getCommunity, clnToken.address === fromToken ? toToken : fromToken)
    const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address: token.mmAddress})

    const ColuLocalCurrency = contract.getContract({abiName: 'ColuLocalCurrency', address: fromToken})
    const data = EllipseMarketMakerContract.methods.change(toToken).encodeABI()

    yield call(ColuLocalCurrency.methods.transferAndCall(token.mmAddress, inAmount, data).send, {
      from: web3.eth.defaultAccount
    })

    yield put({
      type: BALANCE_OF.REQUEST,
      contractAddress: clnToken.address,
      address: web3.eth.defaultAccount
    })

    yield put({
      type: BALANCE_OF.REQUEST,
      contractAddress: token.address,
      address: web3.eth.defaultAccount
    })

    yield fetchMarketMakerData({contractAddress: token.address, mmAddress: token.mmAddress})

    yield put({type: actions.CHANGE.SUCCESS,
      address: token.address,
      response: {
        address: token.address
      }})
  } catch (error) {
    yield put({type: actions.CC_RESERVE.FAILURE, error})
  }
}

export function * fetchMarketMakerData ({contractAddress, mmAddress}) {
  try {
    const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address: mmAddress})

    const calls = {
      currentPrice: call(EllipseMarketMakerContract.methods.getCurrentPrice().call),
      clnReserve: call(EllipseMarketMakerContract.methods.R1().call),
      ccReserve: call(EllipseMarketMakerContract.methods.R2().call)
    }

    const response = yield all(calls)
    response.isMarketMakerLoaded = true
    yield put({type: actions.FETCH_MARKET_MAKER_DATA.SUCCESS,
      contractAddress,
      response
    })
  } catch (error) {
    console.error(error)
    yield put({type: actions.FETCH_MARKET_MAKER_DATA.FAILURE, contractAddress, error})
  }
}

export default function * rootSaga () {
  yield all([
    takeEvery(actions.GET_CURRENT_PRICE.REQUEST, getCurrentPrice),
    takeEvery(actions.CLN_RESERVE.REQUEST, clnReserve),
    takeEvery(actions.CC_RESERVE.REQUEST, ccReserve),
    takeEvery(actions.QUOTE.REQUEST, quote),
    takeEvery(actions.CHANGE.REQUEST, change),
    takeEvery(actions.FETCH_MARKET_MAKER_DATA.REQUEST, fetchMarketMakerData)
  ])
}
