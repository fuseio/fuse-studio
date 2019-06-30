import { all, call, put, takeEvery, select } from 'redux-saga/effects'
import request from 'superagent'
import { givenWeb3 as web3, getWeb3 } from 'services/web3'
import { portis } from 'services/web3/providers/portis'
import { isNetworkSupported, toLongName } from 'utils/network'
import * as actions from 'actions/network'
import { balanceOfCln } from 'actions/accounts'
import { loadModal } from 'actions/ui'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import { networkIdToName } from 'constants/network'
import { saveState } from 'utils/storage'

function * getNetworkTypeInternal () {
  const networkId = yield web3.eth.net.getId()
  const networkType = networkIdToName[networkId]
  return { networkId, networkType }
}

function * getAccountAddress () {
  debugger
  if (window.ethereum && window.ethereum.enable) {
    try {
      const enableResponse = yield window.ethereum.enable()
      if (enableResponse) {
        return web3.utils.toChecksumAddress(enableResponse[0])
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }
  return web3.utils.toChecksumAddress(web3.eth.defaultAccount)
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

function * getNetworkType () {
  try {
    const { networkType, networkId } = yield getNetworkTypeInternal()
    const bridgeSides = yield deduceBridgeSides(networkType)

    yield put({ type: actions.GET_NETWORK_TYPE.SUCCESS,
      response: {
        networkType,
        networkId,
        isMetaMask: web3.currentProvider.connection.isMetaMask || false,
        isPortis: web3.currentProvider.connection.isPortis || false,
        ...bridgeSides
      } })
    const accountAddress = yield getAccountAddress()

    if (accountAddress) {
      const isChanged = yield call(checkAccountChanged, { selectedAddress: accountAddress })
      if (!isChanged) {
        yield put(balanceOfCln(accountAddress))
      }
    }

    if (!isNetworkSupported(networkType)) {
      yield put({ type: actions.UNSUPPORTED_NETWORK_ERROR,
        error: {
          msg: `${networkType} is not supported`,
          networkType
        }
      })
    }
  } catch (error) {
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
  const checksummedAddress = selectedAddress && web3.utils.toChecksumAddress(selectedAddress)

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

function * changeNetwork ({ networkType }) {
  portis.changeNetwork(toLongName(networkType))
  yield call(getNetworkType)
  yield put({
    type: actions.CHANGE_NETWORK.SUCCESS
  })
}

export default function * web3Saga () {
  yield all([
    takeEvery(actions.GET_NETWORK_TYPE.REQUEST, getNetworkType),
    takeEvery(actions.CHECK_ACCOUNT_CHANGED.REQUEST, checkAccountChanged),
    takeEvery(actions.FETCH_GAS_PRICES.REQUEST, fetchGasPrices),
    takeEvery(actions.GET_BLOCK_NUMBER.REQUEST, getBlockNumber),
    takeEvery(actions.CHANGE_NETWORK.REQUEST, changeNetwork),
    takeEvery(actions.GET_NETWORK_TYPE.SUCCESS, watchGetNetworkTypeSuccess)
  ])
}
