import { call, all, put, select, delay, takeEvery } from 'redux-saga/effects'

import { tryTakeEvery } from './utils'
import { getAccountAddress } from 'selectors/accounts'
import { getBlockNumber, getForeignNetwork } from 'selectors/network'
import { transactionFlow } from './transaction'
import * as actions from 'actions/bridge'
import BasicTokenABI from '@fuse/token-factory-contracts/abi/BasicToken'
import { getWeb3 } from 'sagas/network'
import BasicForeignBridgeABI from 'constants/abi/BasicForeignBridge'
import BasicHomeBridgeABI from 'constants/abi/BasicHomeBridge'
import { getCommunityAddress } from 'selectors/entities'
import { getForeignTokenByCommunityAddress, getHomeTokenByCommunityAddress } from 'selectors/token'
import { balanceOfToken } from 'actions/accounts'
import { fetchTokenTotalSupply, MINT_TOKEN, BURN_TOKEN } from 'actions/token'

function * transferToHome ({ foreignTokenAddress, foreignBridgeAddress, value, confirmationsLimit }) {
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  const basicToken = new web3.eth.Contract(BasicTokenABI, foreignTokenAddress, { transactionConfirmationBlocks: confirmationsLimit })

  window.analytics.track('Bridge used', { tokenAddress: foreignTokenAddress, networkType: 'fuse' })
  const transactionPromise = basicToken.methods.transfer(foreignBridgeAddress, value).send({
    from: accountAddress
  })

  const action = actions.TRANSFER_TO_HOME
  yield call(transactionFlow, { transactionPromise, action, confirmationsLimit })
}

function * transferToForeign ({ homeTokenAddress, homeBridgeAddress, value, confirmationsLimit }) {
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  const basicToken = new web3.eth.Contract(BasicTokenABI, homeTokenAddress, { transactionConfirmationBlocks: confirmationsLimit })

  window.analytics.track('Bridge used', { tokenAddress: homeTokenAddress, networkType: yield select(getForeignNetwork) })
  const transactionPromise = basicToken.methods.transfer(homeBridgeAddress, value).send({
    from: accountAddress
  })

  const action = actions.TRANSFER_TO_FOREIGN
  yield call(transactionFlow, { transactionPromise, action, confirmationsLimit })
}

const getRelayEventByTransactionHash = (events, transactionHash) => {
  for (let ev of events) {
    if (ev.returnValues.transactionHash === transactionHash) {
      return ev
    }
  }
}

function * pollForBridgeEvent ({ bridgeContract, transactionHash, fromBlock, eventName }) {
  while (true) {
    const events = yield bridgeContract.getPastEvents(eventName, { fromBlock })
    const bridgeEvent = getRelayEventByTransactionHash(events, transactionHash)

    if (bridgeEvent) {
      return bridgeEvent
    }

    yield delay(CONFIG.web3.bridge.pollingTimeout)
  }
}

function * watchForeignBridge ({ foreignBridgeAddress, transactionHash }) {
  const foreignNetwork = yield select(getForeignNetwork)
  const fromBlock = yield select(getBlockNumber, foreignNetwork)
  const options = { bridgeType: 'foreign' }
  const web3 = yield getWeb3(options)
  const bridgeContract = new web3.eth.Contract(BasicForeignBridgeABI, foreignBridgeAddress)

  const relayEvent = yield pollForBridgeEvent({ bridgeContract, transactionHash, fromBlock, eventName: 'RelayedMessage' })

  yield put({
    type: actions.WATCH_FOREIGN_BRIDGE.SUCCESS,
    response: {
      relayEvent
    }
  })
}

function * watchHomeBridge ({ homeBridgeAddress, transactionHash }) {
  const homeNetwork = yield select(state => state.network.homeNetwork)
  const fromBlock = yield select(getBlockNumber, homeNetwork)
  const options = { bridgeType: 'home' }
  const web3 = yield getWeb3(options)
  const bridgeContract = new web3.eth.Contract(BasicHomeBridgeABI, homeBridgeAddress)

  const relayEvent = yield pollForBridgeEvent({ bridgeContract, transactionHash, fromBlock, eventName: 'AffirmationCompleted' })

  yield put({
    type: actions.WATCH_HOME_BRIDGE.SUCCESS,
    response: {
      relayEvent
    }
  })
}

function * watchBridgeTransfers () {
  const communityAddress = yield select(getCommunityAddress)
  const accountAddress = yield select(getAccountAddress)
  const foreignToken = yield select(state => getForeignTokenByCommunityAddress(state, communityAddress))
  const homeToken = yield select(state => getHomeTokenByCommunityAddress(state, communityAddress))

  yield all([
    put(balanceOfToken(homeToken.address, accountAddress, { bridgeType: 'home' })),
    put(balanceOfToken(foreignToken.address, accountAddress, { bridgeType: 'foreign' })),
    put(fetchTokenTotalSupply(homeToken.address, { bridgeType: 'home' })),
    put(fetchTokenTotalSupply(foreignToken.address, { bridgeType: 'foreign' }))
  ])
}

export default function * bridgeSaga () {
  yield all([
    tryTakeEvery(actions.TRANSFER_TO_HOME, transferToHome, 1),
    tryTakeEvery(actions.TRANSFER_TO_FOREIGN, transferToForeign, 1),
    tryTakeEvery(actions.WATCH_FOREIGN_BRIDGE, watchForeignBridge, 1),
    tryTakeEvery(actions.WATCH_HOME_BRIDGE, watchHomeBridge, 1),
    takeEvery([
      MINT_TOKEN.SUCCESS,
      BURN_TOKEN.SUCCESS,
      actions.WATCH_HOME_BRIDGE.SUCCESS,
      actions.WATCH_FOREIGN_BRIDGE.SUCCESS
    ], watchBridgeTransfers, 1)
  ])
}
