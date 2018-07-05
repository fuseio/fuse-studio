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
  try {
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
  } catch (error) {
    yield put({type: actions.QUOTE.FAILURE, error})
  }
}

export function * invertQuote ({tokenAddress, amount, isBuying}) {
  try {
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
  } catch (error) {
    yield put({type: actions.INVERT_QUOTE.FAILURE, error})
  }
}

export function * change ({tokenAddress, amount, minReturn, isBuying}) {
  try {
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

    yield call(ColuLocalCurrency.methods.transferAndCall(token.mmAddress, amount, data).send, {
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
    yield put({type: actions.CHANGE.FAILURE, error})
  }
}

export function * slippage ({fromToken, inAmount, outAmount, toToken, isBuying}) {
  const clnToken = yield select(getClnToken)
  let ccToken = yield select(getCommunity, isBuying ? toToken : fromToken)
  const EllipseMarketMakerContract = contract.getContract({abiName: 'EllipseMarketMaker', address: ccToken.mmAddress})

  const {r1, r2, s1, s2} = getReservesAndSupplies(clnToken, ccToken, isBuying)
  const updatedR1 = new BigNumber(r1).plus(inAmount)
  const updatedR2 = new BigNumber(r2).minus(outAmount)

  const futurePrice = yield call(EllipseMarketMakerContract.methods.getCurrentPrice(
    updatedR1, updatedR2, s1, s2).call)
  // const slippage =
  // yield put({
  //   type: actions.SLIPPAGE.SUCCESS,
  //   response: {
  //     slippage:
  //   }
  // })
}

export function * buyQuote ({tokenAddress, clnAmount}) {
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

export function * buyCc ({amount, tokenAddress, minReturn}) {
  try {
    yield call(change, {
      tokenAddress,
      amount,
      isBuying: true,
      minReturn
    })
    yield put({type: actions.BUY_CC.SUCCESS,
      address: tokenAddress,
      response: {
        address: tokenAddress
      }})
  } catch (error) {
    yield put({type: actions.BUY_CC.FAILURE, error})
  }
}

export function * sellCc ({amount, tokenAddress, minReturn}) {
  try {
    yield call(change, {
      tokenAddress,
      amount,
      isBuying: false,
      minReturn
    })

    yield put({type: actions.SELL_CC.SUCCESS,
      address: tokenAddress,
      response: {
        address: tokenAddress
      }})
  } catch (error) {
    yield put({type: actions.SELL_CC.FAILURE, error})
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
    response.currentPrice = 1 / response.currentPrice
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
    takeEvery(actions.BUY_QUOTE.REQUEST, buyQuote),
    takeEvery(actions.SELL_QUOTE.REQUEST, sellQuote),
    takeEvery(actions.INVERT_BUY_QUOTE.REQUEST, invertBuyQuote),
    takeEvery(actions.INVERT_SELL_QUOTE.REQUEST, invertSellQuote),
    takeEvery(actions.CHANGE.REQUEST, change),
    takeEvery(actions.BUY_CC.REQUEST, buyCc),
    takeEvery(actions.SELL_CC.REQUEST, sellCc),
    takeEvery(actions.SLIPPAGE.REQUEST, slippage),
    takeEvery(actions.FETCH_MARKET_MAKER_DATA.REQUEST, fetchMarketMakerData)
  ])
}
