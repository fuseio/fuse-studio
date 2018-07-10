import { all, put, takeEvery, select } from 'redux-saga/effects'
import request from 'superagent'

import web3 from 'services/web3'
import {isNetworkSupported} from 'utils/web3'
import * as actions from 'actions/web3'
import {loadModal} from 'actions/ui'
import { ERROR_MODAL } from 'constants/uiConstants'

function * getNetworkType () {
  try {
    const networkType = yield web3.eth.net.getNetworkType()
    yield put({type: actions.GET_NETWORK_TYPE.SUCCESS,
      response: {
        networkType,
        isMetaMask: web3.currentProvider.isMetaMask || false
      }})
    if (web3.eth.defaultAccount) {
      yield put(actions.selectAccount(web3.eth.defaultAccount))
    }

    if (!isNetworkSupported(networkType)) {
      yield put({type: actions.UNSUPPORTED_NETWORK_ERROR,
        error: {
          msg: `${networkType} is not supported`,
          networkType
        }
      })
    }
  } catch (error) {
    yield put(loadModal(ERROR_MODAL))
    yield put({type: actions.GET_NETWORK_TYPE.FAILURE, error})
  }
}

function * fetchGasPrices () {
  const response = yield request.get('https://ethgasstation.info/json/ethgasAPI.json')
  yield put({
    type: actions.FETCH_GAS_PRICES.SUCCESS,
    response: {
      gas: response.body
    }
  })
}

function * watchAccountChanges ({selectedAddress, networkVersion}) {
  const accountAddress = yield select(state => state.web3.accountAddress)
  const checksummedAddress = selectedAddress && web3.utils.toChecksumAddress(selectedAddress)
  if (accountAddress !== checksummedAddress) {
    yield put(actions.selectAccount(checksummedAddress))
  }
}

export default function * rootSaga () {
  yield all([
    takeEvery(actions.GET_NETWORK_TYPE.REQUEST, getNetworkType),
    takeEvery(actions.CHECK_ACCOUNT_CHANGE, watchAccountChanges),
    takeEvery(actions.FETCH_GAS_PRICES.REQUEST, fetchGasPrices)
  ])
}
