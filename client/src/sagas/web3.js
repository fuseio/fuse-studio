import { all, put, takeEvery } from 'redux-saga/effects'
import web3 from 'services/web3'
import {isNetworkSupported} from 'utils/web3'
import * as actions from 'actions/web3'

export function * getNetworkType () {
  try {
    const networkType = yield web3.eth.net.getNetworkType()

    yield put({type: actions.GET_NETWORK_TYPE.SUCCESS,
      response: {
        networkType,
        isMetaMask: web3.currentProvider.isMetaMask || false
      }})
    if (!isNetworkSupported(networkType)) {
      yield put({type: actions.UNSUPPORTED_NETWORK_ERROR,
        error: {
          msg: `${networkType} is not supported`,
          networkType,
          supportedNetworks: CONFIG.web3.supportedNetworks
        }
      })
    }
  } catch (error) {
    yield put({type: actions.GET_NETWORK_TYPE.FAILURE, error})
  }
}

export default function * rootSaga () {
  yield all([
    takeEvery(actions.GET_NETWORK_TYPE.REQUEST, getNetworkType)
  ])
}
