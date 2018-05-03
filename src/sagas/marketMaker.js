import { all, call, put, take, fork } from 'redux-saga/effects'

import * as actions from 'actions/marketMaker'
import { contract } from 'osseus-wallet'

export function * getCurrentPrice (address, contractAddress) {
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

export function * watchGetCurrentPrice () {
  while (true) {
    const {address, contractAddress} = yield take(actions.GET_CURRENT_PRICE.REQUEST)
    yield fork(getCurrentPrice, address, contractAddress)
  }
}

export default function * rootSaga () {
  yield all([
    fork(watchGetCurrentPrice)
  ])
}
