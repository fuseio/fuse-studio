import last from 'lodash/last'
import { all, fork, call, put, takeEvery, select, take } from 'redux-saga/effects'
import request from 'superagent'
import { toChecksumAddress } from 'web3-utils'
import { getWeb3 as getWeb3Service } from 'services/web3'
import { toLongName } from 'utils/network'
import * as actions from 'actions/network'
import { balanceOfFuse, fetchCommunities } from 'actions/accounts'
import { networkIdToName } from 'constants/network'
import providers from 'constants/providers'
import { saveState } from 'utils/storage'
import { processTransactionHash } from 'services/api/misc'
import { getNetworkSide, getForeignNetwork } from 'selectors/network'
import { apiCall, tryTakeEvery } from './utils'
import { eventChannel } from 'redux-saga'

const cb = (error, result) => {
  if (!error) {
    // console.log(result)
  } else {
    console.log(error.code)
  }
}

function * getNetworkTypeInternal (web3) {
  const networkId = yield web3.eth.net.getId(cb)
  const networkType = networkIdToName[networkId] || 'unknown'
  return { networkId, networkType }
}

export function getProviderInfo (provider) {
  let result = {
    name: 'Web3',
    type: 'injected',
    check: 'isWeb3',
    styled: {
      noShadow: false
    }
  }

  if (provider) {
    const matches = providers.filter(_provider => provider[_provider.check])
    if (!!matches && matches.length) {
      result = last(matches)
    }
  }

  return result
}

function * watchNetworkChanges (provider) {
  const chan = eventChannel(emitter => {
    provider.on('networkChanged', (message) => emitter(message))
    return () => {
      provider.close().then(() => console.log('logout'))
    }
  })
  while (true) {
    const message = yield take(chan)
    if (!isNaN(message)) {
      const web3 = yield getWeb3Service({ provider })
      yield call(checkNetworkType, { web3 })
    }
  }
}

function * connectToWallet ({ provider }) {
  try {
    if (provider.isMetaMask) {
      provider.autoRefreshOnNetworkChange = false
    }

    saveState('state.reconnect', true)
    const web3 = yield getWeb3Service({ provider })
    const providerInfo = getProviderInfo(provider)
    const accounts = yield web3.eth.getAccounts(cb)
    const accountAddress = accounts[0]

    yield fork(watchNetworkChanges, provider)
    yield call(checkNetworkType, { web3 })

    yield put({
      type: actions.CONNECT_TO_WALLET.SUCCESS,
      accountAddress,
      response: {
        providerInfo
      }
    })

    window.analytics.identify(accountAddress)
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
    const response = {
      networkType,
      networkId
    }
    if (CONFIG.web3.supportedForeignNetworks.includes(networkType)) {
      const { pathname } = yield select(state => state.router.location)
      if (!pathname.startsWith('/view/community/0x')) {
        response.foreignNetwork = networkType
      }
    }
    yield put({
      type: actions.CHECK_NETWORK_TYPE.SUCCESS,
      response
    })
  } catch (error) {
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
  const web3 = yield getWeb3({ bridgeType })
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
  const { check } = providerInfo
  yield put(fetchCommunities(accountAddress))
  saveState('state.userEthAddress', accountAddress)
  saveState('state.defaultWallet', check.substring(2))
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

export function * getWeb3 ({ bridgeType } = {}) {
  if (!bridgeType) {
    return getWeb3Service()
  } else if (bridgeType === 'home') {
    return getWeb3Service({ networkType: 'fuse' })
  } else {
    const foreignNetwork = yield select(getForeignNetwork)
    return getWeb3Service({ networkType: foreignNetwork })
  }
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
