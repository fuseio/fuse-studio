import { all, call, put, select, takeLatest } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import {BigNumber} from 'bignumber.js'
import { contract } from 'osseus-wallet'

import * as actions from 'actions/marketMaker'
import {BALANCE_OF} from 'actions/basicToken'
import {fetchGasPrices} from 'actions/web3'
import {getClnToken, getCommunity} from 'selectors/basicToken'
import web3 from 'services/web3'
import {tryTakeEvery, tryTakeLatestWithDebounce} from './utils'

export function * getCurrentPrice ({address, tokenAddress}) {
  try {
    const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address})
    const currentPrice = yield call(EllipseMarketMakerContract.methods.getCurrentPrice().call)
    yield put({type: actions.GET_CURRENT_PRICE.SUCCESS,
      tokenAddress,
      response: {
        currentPrice: 1 / currentPrice
      }})
  } catch (error) {
    // no CLN inserted to the contract, so the CC has to value at all
    if (error.message === 'Couldn\'t decode uint256 from ABI: 0x') {
      yield put({type: actions.GET_CURRENT_PRICE.SUCCESS,
        tokenAddress,
        response: {
          currentPrice: 0
        }})
    } else {
      yield put({type: actions.GET_CURRENT_PRICE.FAILURE, error})
    }
  }
}

export function * clnReserve ({address, tokenAddress}) {
  const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address})
  const clnReserve = yield call(EllipseMarketMakerContract.methods.R1().call)
  yield put({type: actions.CLN_RESERVE.SUCCESS,
    tokenAddress,
    response: {
      clnReserve
    }})
}

export function * ccReserve ({address, tokenAddress}) {
  const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address})
  const ccReserve = yield call(EllipseMarketMakerContract.methods.R2().call)
  yield put({type: actions.CC_RESERVE.SUCCESS,
    tokenAddress,
    response: {
      ccReserve
    }})
}

const getReservesAndSupplies = (clnToken, ccToken, isBuying) => isBuying
  ? {
    r1: ccToken.ccReserve,
    r2: ccToken.clnReserve,
    s1: ccToken.totalSupply,
    s2: clnToken.totalSupply
  } : {
    r1: ccToken.clnReserve,
    r2: ccToken.ccReserve,
    s1: clnToken.totalSupply,
    s2: ccToken.totalSupply
  }

const computePrice = (isBuying, inAmount, outAmount) => {
  if (isBuying) {
    return inAmount / outAmount
  } else {
    return outAmount / inAmount
  }
}

export function * quote ({tokenAddress, amount, isBuying}) {
  const clnToken = yield select(getClnToken)
  const token = yield select(getCommunity, tokenAddress)
  const fromTokenAddress = isBuying ? clnToken.address : tokenAddress
  const toTokenAddress = isBuying ? tokenAddress : clnToken.address

  const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address: token.mmAddress})
  let outAmount = yield call(EllipseMarketMakerContract.methods.quote(fromTokenAddress, amount, toTokenAddress).call)

  const price = computePrice(isBuying, amount, outAmount)
  const currentPrice = new BigNumber(token.currentPrice.toString()).multipliedBy(1e18)
  const slippage = currentPrice.minus(price.toString()).div(currentPrice).abs()

  const quotePair = {
    fromTokenAddress,
    toTokenAddress,
    inAmount: amount,
    outAmount,
    price,
    slippage
  }
  yield put({type: actions.QUOTE.SUCCESS,
    address: token.address,
    response: {
      quotePair
    }})
  return quotePair
}

export function * isOpenForPublic ({tokenAddress}) {
  const token = yield select(getCommunity, tokenAddress)
  const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address: token.mmAddress})
  const isOpenForPublic = yield call(EllipseMarketMakerContract.methods.openForPublic().call)

  yield put({type: actions.IS_OPEN_FOR_PUBLIC.SUCCESS,
    tokenAddress,
    response: {
      isOpenForPublic
    }})
}

export function * invertQuote ({tokenAddress, amount, isBuying}) {
  const clnToken = yield select(getClnToken)
  const token = yield select(getCommunity, tokenAddress)
  const fromTokenAddress = isBuying ? clnToken.address : tokenAddress
  const toTokenAddress = isBuying ? tokenAddress : clnToken.address

  const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address: token.mmAddress})

  const {r1, r2, s1, s2} = getReservesAndSupplies(clnToken, token, isBuying)

  const updatedR1 = new BigNumber(r1).minus(amount)
  const updatedR2 = yield call(EllipseMarketMakerContract.methods.calcReserve(
    updatedR1, s1, s2).call)
  const inAmount = new BigNumber(updatedR2).minus(r2)

  const price = computePrice(isBuying, inAmount, amount)
  const currentPrice = new BigNumber(token.currentPrice.toString()).multipliedBy(1e18)
  const slippage = currentPrice.minus(price.toString()).div(currentPrice).abs()

  const quotePair = {
    fromToken: fromTokenAddress,
    toToken: toTokenAddress,
    inAmount: inAmount,
    outAmount: amount,
    price,
    slippage
  }

  yield put({type: actions.INVERT_QUOTE.SUCCESS,
    address: token.address,
    response: {
      quotePair
    }})

  return quotePair
}

export function * change ({tokenAddress, amount, minReturn, isBuying, isEstimation, options}) {
  const clnToken = yield select(getClnToken)
  let token = yield select(getCommunity, tokenAddress)
  const fromTokenAddress = isBuying ? clnToken.address : tokenAddress
  const toTokenAddress = isBuying ? tokenAddress : clnToken.address

  const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address: token.mmAddress})

  const ColuLocalCurrency = contract.getContract({abiName: 'ColuLocalCurrency',
    address: fromTokenAddress})

  let data
  if (minReturn) {
    data = EllipseMarketMakerContract.methods.change(toTokenAddress, minReturn).encodeABI()
  } else {
    data = EllipseMarketMakerContract.methods.change(toTokenAddress).encodeABI()
  }

  if (isEstimation) {
    return yield ColuLocalCurrency.methods.transferAndCall(token.mmAddress, amount, data).estimateGas(
      {from: web3.eth.defaultAccount})
  }

  const sendPromise = ColuLocalCurrency.methods.transferAndCall(token.mmAddress, amount, data).send({
    from: web3.eth.defaultAccount,
    ...options
  })

  const transactionHash = yield new Promise((resolve, reject) => {
    sendPromise.on('transactionHash', (transactionHash) =>
      resolve(transactionHash)
    )
    sendPromise.on('error', (error) =>
      reject(error)
    )
  })

  yield put({type: actions.CHANGE.PENDING,
    tokenAddress: token.address,
    accountAddress: web3.eth.defaultAccount,
    response: {
      transactionHash
    }
  })

  const receipt = yield sendPromise
  if (!Number(receipt.status)) {
    yield put({
      type: actions.CHANGE.FAILURE,
      tokenAddress: token.address,
      accountAddress: web3.eth.defaultAccount,
      response: {receipt}
    })
    return receipt
  }
  yield put({
    type: BALANCE_OF.REQUEST,
    tokenAddress: clnToken.address,
    address: web3.eth.defaultAccount
  })

  yield put({
    type: BALANCE_OF.REQUEST,
    tokenAddress: token.address,
    address: web3.eth.defaultAccount
  })

  yield put({
    type: actions.FETCH_MARKET_MAKER_DATA.REQUEST,
    tokenAddress: token.address,
    mmAddress: token.mmAddress
  })

  yield put({type: actions.CHANGE.SUCCESS,
    tokenAddress: token.address,
    accountAddress: web3.eth.defaultAccount,
    response: {
      receipt
    }
  })

  return receipt
}

export function * buyQuote ({tokenAddress, clnAmount}) {
  yield delay(300)
  const buyQuote = yield call(quote, {
    tokenAddress,
    amount: clnAmount,
    isBuying: true
  })
  yield put({type: actions.BUY_QUOTE.SUCCESS,
    address: tokenAddress,
    response: {
      buyQuote
    }})
}

export function * sellQuote ({tokenAddress, ccAmount}) {
  const sellQuote = yield call(quote, {
    tokenAddress,
    amount: ccAmount,
    isBuying: false
  })

  yield put({type: actions.SELL_QUOTE.SUCCESS,
    address: tokenAddress,
    response: {
      sellQuote
    }})
}

export function * invertBuyQuote ({tokenAddress, ccAmount}) {
  const buyQuote = yield call(invertQuote, {
    tokenAddress,
    amount: ccAmount,
    isBuying: true
  })

  yield put({type: actions.INVERT_BUY_QUOTE.SUCCESS,
    address: tokenAddress,
    response: {
      buyQuote
    }})
}

export function * invertSellQuote ({tokenAddress, clnAmount}) {
  const sellQuote = yield call(invertQuote, {
    tokenAddress,
    amount: clnAmount,
    isBuying: false
  })

  yield put({type: actions.INVERT_SELL_QUOTE.SUCCESS,
    address: tokenAddress,
    response: {
      sellQuote
    }})
}

export function * buyCc ({amount, tokenAddress, minReturn, options}) {
  yield call(change, {
    tokenAddress,
    amount,
    isBuying: true,
    minReturn,
    options
  })
}

export function * sellCc ({amount, tokenAddress, minReturn, options}) {
  yield call(change, {
    tokenAddress,
    amount,
    isBuying: false,
    minReturn,
    options
  })
}

export function * estimateGasBuyCc ({amount, tokenAddress, minReturn}) {
  const estimatedGas = yield call(change, {
    tokenAddress,
    amount,
    isBuying: true,
    minReturn,
    isEstimation: true
  })

  yield put(fetchGasPrices())

  yield put({type: actions.ESTIMATE_GAS_BUY_CC.SUCCESS,
    address: tokenAddress,
    response: {
      estimatedGas
    }})
}

function * estimateGasSellCc ({amount, tokenAddress, minReturn}) {
  const estimatedGas = yield call(change, {
    tokenAddress,
    amount,
    isBuying: false,
    minReturn,
    isEstimation: true
  })

  yield put(fetchGasPrices())

  yield put({type: actions.ESTIMATE_GAS_SELL_CC.SUCCESS,
    address: tokenAddress,
    response: {
      estimatedGas
    }})
}

export function * fetchMarketMakerData ({tokenAddress, mmAddress}) {
  const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address: mmAddress})

  const calls = {
    currentPrice: call(EllipseMarketMakerContract.methods.getCurrentPrice().call),
    clnReserve: call(EllipseMarketMakerContract.methods.R1().call),
    ccReserve: call(EllipseMarketMakerContract.methods.R2().call)
  }

  const response = yield all(calls)
  response.currentPrice = 1 / response.currentPrice
  response.isMarketMakerLoaded = true
  yield put({type: actions.FETCH_MARKET_MAKER_DATA.SUCCESS,
    tokenAddress,
    response
  })
}

export default function * rootSaga () {
  yield all([
    tryTakeEvery(actions.GET_CURRENT_PRICE, getCurrentPrice),
    tryTakeEvery(actions.CLN_RESERVE, clnReserve),
    tryTakeEvery(actions.CC_RESERVE, ccReserve),
    tryTakeEvery(actions.QUOTE, quote),
    tryTakeLatestWithDebounce(actions.BUY_QUOTE, buyQuote),
    tryTakeLatestWithDebounce(actions.SELL_QUOTE, sellQuote),
    tryTakeLatestWithDebounce(actions.INVERT_BUY_QUOTE, invertBuyQuote),
    tryTakeLatestWithDebounce(actions.INVERT_SELL_QUOTE, invertSellQuote),
    tryTakeEvery(actions.CHANGE, change),
    tryTakeEvery(actions.BUY_CC, buyCc),
    tryTakeEvery(actions.SELL_CC, sellCc),
    tryTakeEvery(actions.ESTIMATE_GAS_BUY_CC, estimateGasBuyCc),
    tryTakeEvery(actions.ESTIMATE_GAS_SELL_CC, estimateGasSellCc),
    tryTakeEvery(actions.FETCH_MARKET_MAKER_DATA, fetchMarketMakerData),
    tryTakeEvery(actions.IS_OPEN_FOR_PUBLIC, isOpenForPublic)
  ])
}
