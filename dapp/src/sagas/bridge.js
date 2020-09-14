import { call, all, put, select, delay, takeEvery } from 'redux-saga/effects'

import { tryTakeEvery } from './utils'
import { getAccountAddress } from 'selectors/accounts'
import { getBlockNumber, getForeignNetwork } from 'selectors/network'
import { transactionFlow } from './transaction'
import * as actions from 'actions/bridge'
import BasicTokenABI from '@fuse/token-factory-contracts/abi/BasicToken'
import { getWeb3 } from 'sagas/network'
import { getCommunityAddress } from 'selectors/entities'
import { getForeignTokenByCommunityAddress, getHomeTokenByCommunityAddress } from 'selectors/token'
import { balanceOfToken } from 'actions/accounts'
import { fetchTokenTotalSupply, MINT_TOKEN, BURN_TOKEN } from 'actions/token'
import HomeMultiAMBErc20ToErc677 from 'constants/abi/HomeMultiAMBErc20ToErc677'
import { isZeroAddress } from 'utils/web3'
import { toLongName } from 'utils/network'

export function * fetchHomeTokenAddress ({ communityAddress, foreignTokenAddress }) {
  const web3 = yield getWeb3({ bridgeType: 'home' })
  const homeBridgeMediatorAddress = CONFIG.web3.addresses.multiBridge.fuse.homeBridgeMediator.address
  const homeBridge = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, homeBridgeMediatorAddress)
  const homeTokenAddress = yield call(homeBridge.methods.homeTokenAddress(foreignTokenAddress).call)
  if (isZeroAddress(homeTokenAddress)) {
    console.log(`Not homeTokenAddress for foreignTokenAddress ` + foreignTokenAddress)
    return
  }
  const accountAddress = yield select(getAccountAddress)
  yield put(balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' }))
  yield put({
    type: actions.FETCH_HOME_TOKEN_ADDRESS.SUCCESS,
    communityAddress,
    response: {
      hasHomeTokenInNewBridge: !isZeroAddress(homeTokenAddress),
      homeTokenAddress
    }
  })
  return homeTokenAddress
}

export function * getAllowance ({ tokenAddress, bridgeType = 'foreign' }) {
  const foreignNetwork = yield select(getForeignNetwork)
  const bridgeMediator = bridgeType === 'foreign'
    ? CONFIG.web3.addresses.multiBridge[`${toLongName(foreignNetwork)}`].foreignBridgeMediator.address
    : CONFIG.web3.addresses.multiBridge.fuse.homeBridgeMediator.address
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3({ bridgeType })
  const basicToken = new web3.eth.Contract(BasicTokenABI, tokenAddress)
  const allowance = yield call(basicToken.methods.allowance(accountAddress, bridgeMediator).call)
  yield put({
    type: actions.GET_TOKEN_ALLOWANCE.SUCCESS,
    tokenAddress,
    response: {
      allowance
    }
  })
}

function * approveToken ({ tokenAddress, value, bridgeType = 'foreign' }) {
  const foreignNetwork = yield select(getForeignNetwork)
  const bridgeMediator = bridgeType === 'foreign'
    ? CONFIG.web3.addresses.multiBridge[`${toLongName(foreignNetwork)}`].foreignBridgeMediator.address
    : CONFIG.web3.addresses.multiBridge.fuse.homeBridgeMediator.address
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  const basicToken = new web3.eth.Contract(BasicTokenABI, tokenAddress)

  const transactionPromise = basicToken.methods.approve(bridgeMediator, value).send({
    from: accountAddress
  })

  const action = actions.APPROVE_TOKEN
  const receipt = yield call(transactionFlow, { transactionPromise, action, tokenAddress })
  return receipt
}

function * transferToHome ({ foreignTokenAddress, value, confirmationsLimit }) {
  const foreignNetwork = yield select(getForeignNetwork)
  const foreignBridgeMediator = CONFIG.web3.addresses.multiBridge[`${toLongName(foreignNetwork)}`].foreignBridgeMediator.address
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  const homeBridgeMediator = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, foreignBridgeMediator, { transactionConfirmationBlocks: confirmationsLimit })

  window.analytics.track('Bridge used', { tokenAddress: foreignTokenAddress, networkType: 'fuse' })
  const transactionPromise = homeBridgeMediator.methods.relayTokens(foreignTokenAddress, value).send({
    from: accountAddress
  })

  const action = actions.TRANSFER_TO_HOME
  yield call(transactionFlow, { transactionPromise, action, confirmationsLimit, tokenAddress: foreignTokenAddress })
}

function * transferToForeign ({ homeTokenAddress, value, confirmationsLimit }) {
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  const homeBridgeMediatorAddress = CONFIG.web3.addresses.multiBridge.fuse.homeBridgeMediator.address
  const basicToken = new web3.eth.Contract(BasicTokenABI, homeTokenAddress, { transactionConfirmationBlocks: confirmationsLimit })

  window.analytics.track('Bridge used', { tokenAddress: homeTokenAddress, networkType: yield select(getForeignNetwork) })
  const transactionPromise = basicToken.methods.transferAndCall(homeBridgeMediatorAddress, value, []).send({
    from: accountAddress
  })

  const action = actions.TRANSFER_TO_FOREIGN
  yield call(transactionFlow, { transactionPromise, action, confirmationsLimit })
}

const getRelayEventByTransactionHash = ({ events, transactionHash, accountAddress }) => {
  for (let ev of events) {
    if (ev.returnValues.transactionHash === transactionHash || ev.returnValues.recipient === accountAddress) {
      return ev
    }
  }
}

function * pollForBridgeEvent ({ bridgeContract, transactionHash, fromBlock, eventName, accountAddress }) {
  while (true) {
    const events = yield bridgeContract.getPastEvents(eventName, { fromBlock })
    const bridgeEvent = getRelayEventByTransactionHash({ events, transactionHash, accountAddress })

    if (bridgeEvent) {
      return bridgeEvent
    }

    yield delay(CONFIG.web3.bridge.pollingTimeout)
  }
}

function * watchForeignBridge ({ transactionHash }) {
  const accountAddress = yield select(getAccountAddress)
  const foreignNetwork = yield select(getForeignNetwork)
  const fromBlock = yield select(getBlockNumber, foreignNetwork)
  const options = { bridgeType: 'foreign' }
  const web3 = yield getWeb3(options)
  const foreignBridgeMediator = CONFIG.web3.addresses.multiBridge[`${toLongName(foreignNetwork)}`].foreignBridgeMediator.address
  const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, foreignBridgeMediator)

  const relayEvent = yield pollForBridgeEvent({ bridgeContract, fromBlock, eventName: 'TokensBridged', accountAddress, transactionHash })

  yield put({
    type: actions.WATCH_FOREIGN_BRIDGE.SUCCESS,
    response: {
      relayEvent
    }
  })
}

function * watchHomeBridge ({ transactionHash }) {
  const homeNetwork = yield select(state => state.network.homeNetwork)
  const fromBlock = yield select(getBlockNumber, homeNetwork)
  const options = { bridgeType: 'home' }
  const web3 = yield getWeb3(options)
  const accountAddress = yield select(getAccountAddress)
  const homeBridgeMediatorAddress = CONFIG.web3.addresses.multiBridge.fuse.homeBridgeMediator.address
  const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, homeBridgeMediatorAddress)

  const relayEvent = yield pollForBridgeEvent({ bridgeContract, fromBlock, eventName: 'TokensBridged', accountAddress, transactionHash })

  yield put({
    type: actions.WATCH_HOME_BRIDGE.SUCCESS,
    response: {
      relayEvent
    }
  })
}

function * watchHomeNewTokenRegistered () {
  const accountAddress = yield select(getAccountAddress)
  const homeNetwork = yield select(state => state.network.homeNetwork)
  const fromBlock = yield select(getBlockNumber, homeNetwork)
  const options = { bridgeType: 'home' }
  const web3 = yield getWeb3(options)
  const homeBridgeMediatorAddress = CONFIG.web3.addresses.multiBridge.fuse.homeBridgeMediator.address
  const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, homeBridgeMediatorAddress)

  const relayEvent = yield pollForBridgeEvent({ bridgeContract, fromBlock, eventName: 'NewTokenRegistered', accountAddress })

  yield put({
    type: actions.WATCH_NEW_TOKEN_REGISTERED.SUCCESS,
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
  const homeTokenAddress = yield call(fetchHomeTokenAddress, { communityAddress, foreignTokenAddress: foreignToken.address })
  const calls = [
    put(balanceOfToken(foreignToken.address, accountAddress, { bridgeType: 'foreign' })),
    put(fetchTokenTotalSupply(foreignToken.address, { bridgeType: 'foreign' }))
  ]
  if (homeTokenAddress) {
    calls.push(put(balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })))
    calls.push(put(fetchTokenTotalSupply(homeTokenAddress, { bridgeType: 'home' })))
  } else {
    calls.push(put(balanceOfToken(homeToken.address, accountAddress, { bridgeType: 'home' })))
    calls.push(put(fetchTokenTotalSupply(homeToken.address, { bridgeType: 'home' })))
  }
  yield all(calls)
}

export default function * bridgeSaga () {
  yield all([
    tryTakeEvery(actions.FETCH_HOME_TOKEN_ADDRESS, fetchHomeTokenAddress, 1),
    tryTakeEvery(actions.GET_TOKEN_ALLOWANCE, getAllowance, 1),
    tryTakeEvery(actions.APPROVE_TOKEN, approveToken, 1),
    tryTakeEvery(actions.TRANSFER_TO_HOME, transferToHome, 1),
    tryTakeEvery(actions.TRANSFER_TO_FOREIGN, transferToForeign, 1),
    tryTakeEvery(actions.WATCH_FOREIGN_BRIDGE, watchForeignBridge, 1),
    tryTakeEvery(actions.WATCH_HOME_BRIDGE, watchHomeBridge, 1),
    tryTakeEvery(actions.WATCH_NEW_TOKEN_REGISTERED, watchHomeNewTokenRegistered, 1),
    takeEvery([
      MINT_TOKEN.SUCCESS,
      BURN_TOKEN.SUCCESS,
      actions.WATCH_HOME_BRIDGE.SUCCESS,
      actions.WATCH_FOREIGN_BRIDGE.SUCCESS,
      actions.WATCH_NEW_TOKEN_REGISTERED.SUCCESS
    ], watchBridgeTransfers, 1)
  ])
}
