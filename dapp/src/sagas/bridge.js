import { call, all, put, select, delay, takeEvery } from 'redux-saga/effects'

import { apiCall, createEntityPut, tryTakeEvery } from './utils'
import { getContract } from 'services/contract'
import { getAccountAddress } from 'selectors/accounts'
import { getBlockNumber } from 'selectors/network'
import { transactionFlow } from './transaction'
import * as actions from 'actions/bridge'
import { FETCH_TOKEN_PROGRESS } from 'actions/token'
import * as api from 'services/api/token'

const entityPut = createEntityPut(actions.entityName)

export function * deployBridge ({ foreignTokenAddress }) {
  const response = yield apiCall(api.deployBridge, { foreignTokenAddress })

  yield entityPut({
    type: actions.DEPLOY_BRIDGE.SUCCESS,
    tokenAddress: foreignTokenAddress,
    response: {
      ...response.data,
      foreignTokenAddress
    }
  })
}

function * transferToHome ({ foreignTokenAddress, foreignBridgeAddress, value, confirmationsLimit }) {
  const accountAddress = yield select(getAccountAddress)
  const basicToken = getContract({ abiName: 'BasicToken', address: foreignTokenAddress })

  const transactionPromise = basicToken.methods.transfer(foreignBridgeAddress, value).send({
    from: accountAddress
  })

  const action = actions.TRANSFER_TO_HOME
  yield call(transactionFlow, { transactionPromise, action, confirmationsLimit })
}

function * transferToForeign ({ homeTokenAddress, homeBridgeAddress, value, confirmationsLimit }) {
  const accountAddress = yield select(getAccountAddress)
  const basicToken = getContract({ abiName: 'BasicToken', address: homeTokenAddress })

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
  const foreignNetwork = yield select(state => state.network.foreignNetwork)
  const fromBlock = yield select(getBlockNumber, foreignNetwork)
  const options = { bridgeType: 'foreign' }
  const bridgeContract = getContract({ abiName: 'BasicForeignBridge', address: foreignBridgeAddress, options })

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
  const bridgeContract = getContract({ abiName: 'BasicHomeBridge', address: homeBridgeAddress, options })

  const relayEvent = yield pollForBridgeEvent({ bridgeContract, transactionHash, fromBlock, eventName: 'AffirmationCompleted' })

  yield put({
    type: actions.WATCH_HOME_BRIDGE.SUCCESS,
    response: {
      relayEvent
    }
  })
}

function * watchFetchProgress ({ response }) {
  const { homeTokenAddress, foreignBridgeAddress, foreignTokenAddress, homeBridgeAddress } = response

  yield entityPut({
    type: actions.WATCH_COMMUNITY_DATA.SUCCESS,
    response: {
      homeTokenAddress,
      foreignBridgeAddress,
      foreignTokenAddress,
      homeBridgeAddress
    }
  })
}

export default function * bridgeSaga () {
  yield all([
    tryTakeEvery(actions.DEPLOY_BRIDGE, deployBridge, 1),
    tryTakeEvery(actions.TRANSFER_TO_HOME, transferToHome, 1),
    tryTakeEvery(actions.TRANSFER_TO_FOREIGN, transferToForeign, 1),
    tryTakeEvery(actions.WATCH_FOREIGN_BRIDGE, watchForeignBridge, 1),
    tryTakeEvery(actions.WATCH_HOME_BRIDGE, watchHomeBridge, 1),
    takeEvery(FETCH_TOKEN_PROGRESS.SUCCESS, watchFetchProgress)
  ])
}
