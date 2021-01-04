import { call, all, put, select, delay, takeEvery } from 'redux-saga/effects'
import { tryTakeEvery } from './utils'
import { getAccountAddress } from 'selectors/accounts'
import { getBridgeMediator } from 'selectors/bridge'
import { getBlockNumber, getForeignNetwork } from 'selectors/network'
import { transactionFlow } from './transaction'
import * as actions from 'actions/bridge'
import BasicTokenABI from '@fuse/token-factory-contracts/abi/BasicToken'
import { getWeb3 } from 'sagas/network'
import BasicForeignBridgeABI from 'constants/abi/BasicForeignBridge'
import BasicHomeBridgeABI from 'constants/abi/BasicHomeBridge'
import { getCommunityAddress } from 'selectors/entities'
import { balanceOfToken } from 'actions/accounts'
import { fetchTokenTotalSupply, MINT_TOKEN, BURN_TOKEN, fetchToken } from 'actions/token'
import HomeMultiAMBErc20ToErc677 from 'constants/abi/HomeMultiAMBErc20ToErc677'
import { isZeroAddress } from 'utils/web3'
import { getCurrentCommunity } from 'selectors/dashboard'

export function * fetchHomeTokenAddress ({ communityAddress, foreignTokenAddress, options }) {
  const web3 = yield getWeb3({ bridgeType: 'home' })
  const homeBridgeMediatorAddress = yield select(getBridgeMediator, 'home')
  const homeBridge = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, homeBridgeMediatorAddress)
  const homeTokenAddress = yield call(homeBridge.methods.homeTokenAddress(foreignTokenAddress).call)
  if (isZeroAddress(homeTokenAddress)) {
    console.log(`Not homeTokenAddress for foreignTokenAddress ` + foreignTokenAddress)
    return
  }
  const accountAddress = yield select(getAccountAddress)
  const calls = [
    put(fetchToken(homeTokenAddress)),
    put(balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })),
    put(fetchTokenTotalSupply(homeTokenAddress, { bridgeType: 'home' })),
    put(actions.getTokenAllowance(homeTokenAddress, 'home')),
    put(actions.getTokenAllowance(foreignTokenAddress, 'foreign')),
    put({
      type: actions.FETCH_HOME_TOKEN_ADDRESS.SUCCESS,
      communityAddress,
      response: {
        hasHomeTokenInNewBridge: !isZeroAddress(homeTokenAddress),
        homeTokenAddress
      }
    })
  ]
  yield all(calls)
}

export function * getAllowance ({ tokenAddress, bridgeType = 'foreign', options }) {
  const bridgeMediator = yield select(getBridgeMediator, bridgeType)
  const accountAddress = yield select(getAccountAddress)
  if (accountAddress) {
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
}

function * approveToken ({ tokenAddress, value, bridgeType = 'foreign' }) {
  const bridgeMediator = yield select(getBridgeMediator, bridgeType)
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

function * transferToHome ({ foreignTokenAddress, foreignBridgeAddress, value, confirmationsLimit, multiBridge }) {
  const foreignBridgeMediator = yield select(getBridgeMediator)
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  let transactionPromise
  if (multiBridge) {
    const homeBridgeMediator = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, foreignBridgeMediator, { transactionConfirmationBlocks: confirmationsLimit })
    window.analytics.track('Bridge used', { tokenAddress: foreignTokenAddress, networkType: 'fuse' })
    transactionPromise = homeBridgeMediator.methods.relayTokens(foreignTokenAddress, value).send({
      from: accountAddress
    })
  } else {
    const basicToken = new web3.eth.Contract(BasicTokenABI, foreignTokenAddress, { transactionConfirmationBlocks: confirmationsLimit })
    window.analytics.track('Bridge used', { tokenAddress: foreignTokenAddress, networkType: 'fuse' })
    transactionPromise = basicToken.methods.transfer(foreignBridgeAddress, value).send({
      from: accountAddress
    })
  }

  const action = actions.TRANSFER_TO_HOME
  yield call(transactionFlow, { transactionPromise, action, confirmationsLimit, tokenAddress: foreignTokenAddress })
}

function * transferToForeign ({ homeTokenAddress, homeBridgeAddress, value, confirmationsLimit, multiBridge }) {
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  let transactionPromise
  if (multiBridge) {
    const homeBridgeMediatorAddress = yield select(getBridgeMediator, 'home')
    const basicToken = new web3.eth.Contract(BasicTokenABI, homeTokenAddress, { transactionConfirmationBlocks: confirmationsLimit })
    transactionPromise = basicToken.methods.transferAndCall(homeBridgeMediatorAddress, value, []).send({
      from: accountAddress
    })
  } else {
    const basicToken = new web3.eth.Contract(BasicTokenABI, homeTokenAddress, { transactionConfirmationBlocks: confirmationsLimit })
    transactionPromise = basicToken.methods.transfer(homeBridgeAddress, value).send({
      from: accountAddress
    })
  }

  window.analytics.track('Bridge used', { tokenAddress: homeTokenAddress, networkType: yield select(getForeignNetwork) })
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

function * watchForeignBridge ({ foreignBridgeAddress, transactionHash, multiBridge }) {
  const accountAddress = yield select(getAccountAddress)
  const foreignNetwork = yield select(getForeignNetwork)
  const fromBlock = yield select(getBlockNumber, foreignNetwork)
  const options = { bridgeType: 'foreign' }
  const web3 = yield getWeb3(options)
  let relayEvent
  if (multiBridge) {
    const foreignBridgeMediator = yield select(getBridgeMediator)
    const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, foreignBridgeMediator)
    relayEvent = yield pollForBridgeEvent({ bridgeContract, fromBlock, eventName: 'TokensBridged', accountAddress, transactionHash })
  } else {
    const bridgeContract = new web3.eth.Contract(BasicForeignBridgeABI, foreignBridgeAddress)
    relayEvent = yield pollForBridgeEvent({ bridgeContract, transactionHash, fromBlock, eventName: 'RelayedMessage' })
  }

  yield put({
    type: actions.WATCH_FOREIGN_BRIDGE.SUCCESS,
    response: {
      relayEvent
    }
  })
}

function * watchHomeBridge ({ homeBridgeAddress, transactionHash, multiBridge }) {
  const homeNetwork = yield select(state => state.network.homeNetwork)
  const fromBlock = yield select(getBlockNumber, homeNetwork)
  const options = { bridgeType: 'home' }
  const web3 = yield getWeb3(options)
  let relayEvent
  if (multiBridge) {
    const accountAddress = yield select(getAccountAddress)
    const homeBridgeMediatorAddress = yield select(getBridgeMediator, 'home')
    const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, homeBridgeMediatorAddress)
    relayEvent = yield pollForBridgeEvent({ bridgeContract, fromBlock, eventName: 'TokensBridged', accountAddress, transactionHash })
  } else {
    const bridgeContract = new web3.eth.Contract(BasicHomeBridgeABI, homeBridgeAddress)
    relayEvent = yield pollForBridgeEvent({ bridgeContract, transactionHash, fromBlock, eventName: 'RelayedMessage' })
  }

  yield put({
    type: actions.WATCH_HOME_BRIDGE.SUCCESS,
    response: {
      relayEvent
    }
  })
}

function * watchHomeNewTokenRegistered () {
  const accountAddress = yield select(getAccountAddress)
  if (accountAddress) {
    const homeNetwork = yield select(state => state.network.homeNetwork)
    const fromBlock = yield select(getBlockNumber, homeNetwork)
    const options = { bridgeType: 'home' }
    const web3 = yield getWeb3(options)
    const homeBridgeMediatorAddress = yield select(getBridgeMediator, 'home')
    const bridgeContract = new web3.eth.Contract(HomeMultiAMBErc20ToErc677, homeBridgeMediatorAddress)

    const relayEvent = yield pollForBridgeEvent({ bridgeContract, fromBlock, eventName: 'NewTokenRegistered', accountAddress })

    yield put({
      type: actions.WATCH_NEW_TOKEN_REGISTERED.SUCCESS,
      response: {
        relayEvent
      }
    })
  }
}

function * watchBridgeTransfers () {
  const accountAddress = yield select(getAccountAddress)
  if (accountAddress) {
    const communityAddress = yield select(getCommunityAddress)
    const { foreignTokenAddress, homeTokenAddress } = yield select(state => getCurrentCommunity(state, communityAddress))
    const calls = [
      put(balanceOfToken(foreignTokenAddress, accountAddress, { bridgeType: 'foreign' })),
      put(fetchTokenTotalSupply(foreignTokenAddress, { bridgeType: 'foreign' })),
      put(actions.fetchHomeTokenAddress(communityAddress, foreignTokenAddress))
    ]
    if (homeTokenAddress) {
      calls.push(
        put(balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })),
        put(fetchTokenTotalSupply(homeTokenAddress, { bridgeType: 'home' }))
      )
    }
    yield all(calls)
  }
}

function * watchApproveToken () {
  const communityAddress = yield select(getCommunityAddress)
  const { foreignTokenAddress, homeTokenAddress } = yield select(state => getCurrentCommunity(state, communityAddress))
  const { homeTokenAddress: currentHomeToken } = yield select(state => state.screens.dashboard)
  yield put(actions.getTokenAllowance(foreignTokenAddress, 'foreign'))
  yield put(actions.getTokenAllowance(homeTokenAddress, 'home'))
  if (currentHomeToken) {
    yield put(actions.getTokenAllowance(currentHomeToken, 'home'))
  }
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
    takeEvery([actions.APPROVE_TOKEN.SUCCESS], watchApproveToken, 1),
    takeEvery([
      MINT_TOKEN.SUCCESS,
      BURN_TOKEN.SUCCESS,
      actions.WATCH_HOME_BRIDGE.SUCCESS,
      actions.WATCH_FOREIGN_BRIDGE.SUCCESS,
      actions.WATCH_NEW_TOKEN_REGISTERED.SUCCESS
    ], watchBridgeTransfers, 1)
  ])
}
