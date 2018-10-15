import { all, call, put, takeEvery, select } from 'redux-saga/effects'
import request from 'superagent'
import web3 from 'services/web3'
import {isNetworkSupported} from 'utils/network'
import * as actions from 'actions/network'
import {updateBalances} from 'actions/accounts'
import {loadModal} from 'actions/ui'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'

function * getNetworkType () {
  try {
    const networkType = yield web3.eth.net.getNetworkType()
    yield put({type: actions.GET_NETWORK_TYPE.SUCCESS,
      response: {
        networkType,
        isMetaMask: web3.currentProvider.isMetaMask || false
      }})
    if (web3.eth.defaultAccount) {
      const isChanged = yield call(checkAccountChanged, {selectedAddress: web3.eth.defaultAccount})
      if (!isChanged) {
        yield put(updateBalances(web3.eth.defaultAccount))
      }
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
    yield put(loadModal(WRONG_NETWORK_MODAL))
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

function * checkAccountChanged ({selectedAddress}) {
  const accountAddress = yield select(state => state.network.accountAddress)
  const checksummedAddress = selectedAddress && web3.utils.toChecksumAddress(selectedAddress)
  if (accountAddress !== checksummedAddress) {
    yield put({
      type: checksummedAddress ? actions.CHECK_ACCOUNT_CHANGED.SUCCESS : actions.ACCOUNT_LOGGED_OUT,
      response: {
        accountAddress: checksummedAddress
      }
    })
    return true
  }
  return false
}

export default function * web3Saga () {
  yield all([
    takeEvery(actions.GET_NETWORK_TYPE.REQUEST, getNetworkType),
    takeEvery(actions.CHECK_ACCOUNT_CHANGED.REQUEST, checkAccountChanged),
    takeEvery(actions.FETCH_GAS_PRICES.REQUEST, fetchGasPrices)
  ])
}
