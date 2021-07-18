import { all, fork, call, put, takeEvery, select, take, delay } from 'redux-saga/effects'
import request from 'superagent'
import { toChecksumAddress } from 'web3-utils'
import { getWeb3 as getWeb3Service } from 'services/web3'
import { toLongName } from 'utils/network'
import * as actions from 'actions/network'
import { saveUserAccount, fetchUserAccounts } from 'actions/user'
import { balanceOfFuse, balanceOfNative, fetchCommunities } from 'actions/accounts'
import { networkIdToName } from 'constants/network'
import { getProviderInfo } from 'web3modal'
import { saveState } from 'utils/storage'
import { processTransactionHash } from 'services/api/misc'
import { getNetworkSide, getForeignNetwork } from 'selectors/network'
import { getAccountAddress } from 'selectors/accounts'
import { apiCall, tryTakeEvery } from './utils'
import { eventChannel } from 'redux-saga'
import { toShortName } from '../utils/network'
import mobxStore from 'store/mobx'

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

function * watchNetworkChanges (provider) {
  const chan = eventChannel(emitter => {
    provider.on('chainChanged', (message) => emitter(message))
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

function * watchAccountChanges (provider) {
  const chan = eventChannel(emitter => {
    provider.on('accountsChanged', (message) => emitter(message))
    return () => {
      provider.close().then(() => console.log('accountsChanged'))
    }
  })
  while (true) {
    const message = yield take(chan)
    if (!isNaN(message)) {
      yield getWeb3Service({ provider })
      yield call(connectToWallet)
    }
  }
}

function * connectToWallet () {
  const web3 = yield getWeb3Service()
  const provider = web3.currentProvider

  try {
    if (provider.isMetaMask) {
      provider.autoRefreshOnNetworkChange = false
    }

    const providerInfo = getProviderInfo(provider)

    const accounts = yield web3.eth.getAccounts(cb)
    const accountAddress = accounts[0]

    yield fork(watchNetworkChanges, provider)
    yield fork(watchAccountChanges, provider)
    yield delay(1500)
    yield call(checkNetworkType, { web3, accountAddress })
    yield put(saveUserAccount(providerInfo.name.toLowerCase(), accountAddress))
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

function * checkNetworkType ({ web3, accountAddress }) {
  try {
    if (!accountAddress) {
      accountAddress = yield select(getAccountAddress)
    }
    const { networkType, networkId } = yield getNetworkTypeInternal(web3)
    const response = {
      networkType,
      networkId,
      accountAddress
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
    yield put(balanceOfNative(accountAddress, { bridgeType: 'home' }))
    yield put(balanceOfNative(accountAddress, { bridgeType: 'foreign' }))
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
  const { networkId, homeNetwork = 'fuse', networkType } = response
  saveState('state.network', { foreignNetwork: networkId === 122 ? (yield select(getForeignNetwork)) : networkType, homeNetwork, networkType })
}

function * watchConnectToWallet ({ accountAddress }) {
  yield put(fetchCommunities(accountAddress))
  yield put(fetchUserAccounts())
}

function * changeNetwork ({ networkType }) {
  const foreignNetwork = yield select(getForeignNetwork)
  const currentNetwork = toLongName(networkType)
  const isFuseNetwork = currentNetwork === 'fuse'
  saveState('state.network', { homeNetwork: 'fuse', foreignNetwork: isFuseNetwork ? foreignNetwork : currentNetwork, networkType: currentNetwork })
  const web3 = yield getWeb3()
  const providerInfo = getProviderInfo(web3.currentProvider)
  const { check } = providerInfo
  if (check === 'isPortis') {
    yield web3.currentProvider._portis.changeNetwork(currentNetwork)
    yield web3.eth.net.getId()
    yield call(checkNetworkType, { web3 })
  }
  if (check === 'isTorus') {
    yield web3.currentProvider.torus.setProvider({
      host: isFuseNetwork ? CONFIG.web3.fuseProvider : currentNetwork,
      networkName: currentNetwork,
      chainId: isFuseNetwork ? CONFIG.web3.chainId.fuse : undefined
    })
    yield web3.eth.net.getId()
    yield call(checkNetworkType, { web3 })
  }
  mobxStore.network.initWeb3(web3.currentProvider)
  yield put({
    type: actions.CHANGE_NETWORK.SUCCESS
  })
}

function * sendTransactionHash ({ transactionHash, abiName }) {
  const bridgeType = yield select(getNetworkSide)
  yield apiCall(processTransactionHash, { transactionHash, abiName, bridgeType })
  yield put({
    transactionHash,
    type: actions.SEND_TRANSACTION_HASH.SUCCESS
  })
}

export function * getWeb3 ({ bridgeType, networkType } = {}) {
  if (!bridgeType) {
    return getWeb3Service()
  } else if (bridgeType === 'home') {
    return getWeb3Service({ networkType: 'fuse' })
  } else {
    const foreignNetwork = networkType || (yield select(getForeignNetwork))
    return getWeb3Service({ networkType: toShortName(foreignNetwork) })
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
