import get from 'lodash/get'
import { all, call, put, takeEvery, select } from 'redux-saga/effects'
import request from 'superagent'
import { toChecksumAddress } from 'web3-utils'
import isEmpty from 'lodash/isEmpty'
import { getWeb3 } from 'services/web3'
import { portis, getProvider as getPortisProvider } from 'services/web3/providers/portis'
import { isNetworkSupported, toLongName } from 'utils/network'
import * as actions from 'actions/network'
import { balanceOfFuse } from 'actions/accounts'
import { loadModal } from 'actions/ui'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import { networkIdToName } from 'constants/network'
import { saveState, loadState } from 'utils/storage'
import { processTransactionHash } from 'services/api/misc'
import { getNetworkSide } from 'selectors/network'
import { apiCall, tryTakeEvery } from './utils'

function * getNetworkTypeInternal (web3) {
  const networkId = yield web3.eth.net.getId()
  const networkType = networkIdToName[networkId]
  return { networkId, networkType }
}

function * deduceBridgeSides (networkType) {
  if (networkType === 'fuse') {
    const foreignNetwork = yield select(state => state.network.foreignNetwork)
    return {
      foreignNetwork,
      homeNetwork: 'fuse'
    }
  } else {
    return {
      foreignNetwork: networkType,
      homeNetwork: 'fuse'
    }
  }
}

function * connectToWallet ({ provider }) {
  try {
    const web3 = yield getWeb3({ provider })
    const accounts = yield web3.eth.getAccounts()
    const accountAddress = accounts[0]
    yield call(getNetworkType, { web3 })
    yield put({
      type: actions.CONNECT_TO_WALLET.SUCCESS,
      accountAddress,
      response: {
        web3
      }
    })
    const isChanged = yield call(checkAccountChanged, { selectedAddress: accountAddress })
    if (!isChanged) {
      yield put(balanceOfFuse(accountAddress))
    }
  } catch (error) {
    yield put({
      type: actions.CONNECT_TO_WALLET.FAILURE
    })
  }
}

function * getNetworkType ({ web3 }) {
  try {
    const { networkType, networkId } = yield getNetworkTypeInternal(web3)

    const bridgeSides = yield deduceBridgeSides(networkType)
    const isMetaMask = get(web3.currentProvider, 'isMetaMask', false) || get(web3.currentProvider.connection, 'isMetaMask', false)
    const isPortis = get(web3.currentProvider, 'isPortis', false) || get(web3.currentProvider.connection, 'isPortis', false)
    yield put({
      type: actions.GET_NETWORK_TYPE.SUCCESS,
      response: {
        networkType,
        networkId,
        isMetaMask,
        isPortis,
        ...bridgeSides
      } })

    if (!isNetworkSupported(networkType)) {
      yield put({
        type: actions.UNSUPPORTED_NETWORK_ERROR,
        error: {
          msg: `${networkType} is not supported`,
          networkType
        }
      })
      throw new Error('This network is not supported')
    }
  } catch (error) {
    yield put({
      type: 'ERROR',
      error
    })
    yield put(loadModal(WRONG_NETWORK_MODAL))
    yield put({ type: actions.GET_NETWORK_TYPE.FAILURE, error })
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

function * checkAccountChanged ({ selectedAddress }) {
  const accountAddress = yield select(state => state.network.accountAddress)
  const checksummedAddress = selectedAddress && toChecksumAddress(selectedAddress)

  if (accountAddress !== checksummedAddress) {
    yield put({
      type: checksummedAddress ? actions.CHECK_ACCOUNT_CHANGED.SUCCESS : actions.ACCOUNT_LOGGED_OUT,
      accountAddress: checksummedAddress,
      response: {
        accountAddress: checksummedAddress
      }
    })
    return true
  }
  return false
}

function * getBlockNumber ({ networkType, bridgeType }) {
  const web3 = getWeb3({ bridgeType })
  const blockNumber = yield call(web3.eth.getBlockNumber)
  yield put({
    type: actions.GET_BLOCK_NUMBER.SUCCESS,
    networkType,
    response: {
      blockNumber
    }
  })
}

function * watchGetNetworkTypeSuccess ({ response }) {
  const { foreignNetwork, homeNetwork } = response
  saveState('state.network', { foreignNetwork, homeNetwork })
}

// function * watchConnectToWallet ({ response }) {
//   const { provider } = response
//   saveState('state.provider', { provider })
//   saveState('state.reconnect', true)
// }

function * changeNetwork ({ networkType }) {
  portis.changeNetwork(toLongName(networkType))
  yield call(getNetworkType, true)
  const foreignNetwork = yield select(state => state.network.foreignNetwork)
  saveState('state.network', { homeNetwork: 'fuse', foreignNetwork: networkType === 'fuse' ? foreignNetwork : networkType, networkType })
  yield put({
    type: actions.CHANGE_NETWORK.SUCCESS
  })
  window.location.reload()
}

function * sendTransactionHash ({ transactionHash, abiName }) {
  const bridgeType = yield select(getNetworkSide)
  yield apiCall(processTransactionHash, { transactionHash, abiName, bridgeType })
  yield put({
    transactionHash,
    type: actions.SEND_TRANSACTION_HASH.SUCCESS
  })
}

export default function * web3Saga () {
  yield all([
    takeEvery(actions.GET_NETWORK_TYPE.REQUEST, getNetworkType),
    takeEvery(actions.CONNECT_TO_WALLET.REQUEST, connectToWallet),
    takeEvery(actions.CHECK_ACCOUNT_CHANGED.REQUEST, checkAccountChanged),
    takeEvery(actions.FETCH_GAS_PRICES.REQUEST, fetchGasPrices),
    takeEvery(actions.GET_BLOCK_NUMBER.REQUEST, getBlockNumber),
    takeEvery(actions.CHANGE_NETWORK.REQUEST, changeNetwork),
    takeEvery(actions.GET_NETWORK_TYPE.SUCCESS, watchGetNetworkTypeSuccess),
    // takeEvery(actions.CONNECT_TO_WALLET.SUCCESS, watchConnectToWallet),
    // takeEvery(actions.WEB3_CONNECTED.REQUEST, connectToProvider),
    tryTakeEvery(actions.SEND_TRANSACTION_HASH, sendTransactionHash, 1)
    // WEB3_DISCONNECTED
  ])
}
