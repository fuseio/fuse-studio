import Web3connect from 'web3connect'
import { all, call, put, takeEvery, select } from 'redux-saga/effects'
import request from 'superagent'
import { toChecksumAddress } from 'web3-utils'
import { getWeb3 } from 'services/web3'
import { isNetworkSupported, toLongName } from 'utils/network'
import * as actions from 'actions/network'
import { balanceOfFuse, fetchCommunities } from 'actions/accounts'
import { loadModal } from 'actions/ui'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import { networkIdToName } from 'constants/network'
import { saveState } from 'utils/storage'
import { processTransactionHash } from 'services/api/misc'
import { getNetworkSide, getForeignNetwork } from 'selectors/network'
import { apiCall, tryTakeEvery } from './utils'

const cb = (error, result) => {
  if (!error) {
    // console.log(result)
  } else {
    console.log(error.code)
  }
}

function * getNetworkTypeInternal (web3) {
  const networkId = yield web3.eth.net.getId(cb)
  const networkType = networkIdToName[networkId]
  return { networkId, networkType }
}

function * deduceBridgeSides (networkType) {
  if (networkType === 'fuse') {
    const foreignNetwork = yield select(getForeignNetwork)
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
    saveState('state.reconnect', true)
    const web3 = yield getWeb3({ provider })
    const providerInfo = Web3connect.getProviderInfo(provider)
    const accounts = yield web3.eth.getAccounts(cb)
    const accountAddress = accounts[0]
    yield call(checkNetworkType, { web3 })
    yield put({
      type: actions.CONNECT_TO_WALLET.SUCCESS,
      accountAddress,
      response: {
        providerInfo
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

function * checkNetworkType ({ web3 }) {
  try {
    const { networkType, networkId } = yield getNetworkTypeInternal(web3)
    const bridgeSides = yield deduceBridgeSides(networkType)
    yield put({
      type: actions.CHECK_NETWORK_TYPE.SUCCESS,
      response: {
        networkType,
        networkId,
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
    yield put(loadModal(WRONG_NETWORK_MODAL))
    yield put({ type: actions.CHECK_NETWORK_TYPE.FAILURE, error })
    yield put({
      type: 'ERROR',
      error
    })
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

function * watchCheckNetworkTypeSuccess ({ response }) {
  const { foreignNetwork, homeNetwork } = response
  saveState('state.network', { foreignNetwork, homeNetwork })
}

function * watchConnectToWallet ({ response, accountAddress }) {
  const { providerInfo } = response
  const { name } = providerInfo
  yield put(fetchCommunities(accountAddress))
  saveState('state.userEthAddress', accountAddress)
  saveState('state.defaultWallet', name)
}

function * changeNetwork ({ networkType }) {
  const foreignNetwork = yield select(getForeignNetwork)
  const currentNetwork = toLongName(networkType)
  saveState('state.network', { homeNetwork: 'fuse', foreignNetwork: networkType === 'fuse' ? foreignNetwork : currentNetwork, networkType: currentNetwork })
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
    takeEvery(actions.CHECK_NETWORK_TYPE.REQUEST, checkNetworkType),
    takeEvery(actions.CONNECT_TO_WALLET.REQUEST, connectToWallet),
    takeEvery(actions.CHECK_ACCOUNT_CHANGED.REQUEST, checkAccountChanged),
    takeEvery(actions.FETCH_GAS_PRICES.REQUEST, fetchGasPrices),
    takeEvery(actions.GET_BLOCK_NUMBER.REQUEST, getBlockNumber),
    takeEvery(actions.CHANGE_NETWORK.REQUEST, changeNetwork),
    takeEvery(actions.CHECK_NETWORK_TYPE.SUCCESS, watchCheckNetworkTypeSuccess),
    takeEvery(actions.CONNECT_TO_WALLET.SUCCESS, watchConnectToWallet),
    tryTakeEvery(actions.SEND_TRANSACTION_HASH, sendTransactionHash, 1)
  ])
}
