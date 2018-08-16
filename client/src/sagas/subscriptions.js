import { all, call, put, select, take, takeEvery, race, fork } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import web3Utils from 'web3-utils'
import identity from 'lodash/identity'

import {tryTakeEvery} from './utils'
import * as actions from 'actions/subscriptions'
import {CHECK_ACCOUNT_CHANGED} from 'actions/network'
import {BALANCE_OF} from 'actions/accounts'
import {fetchMarketMakerData} from 'actions/marketMaker'
import {web3Socket, websocketProvider} from 'services/web3'
import {getTokenAddresses} from 'selectors/network'
import {TRANSFER_EVENT, CHANGE_EVENT} from 'constants/events'
import ReactGA from 'services/ga'

let accountChannels = []

function createSubscriptionChannel (subscription) {
  return eventChannel(emit => {
    const dataHandler = emit

    subscription.on('data', dataHandler)

    subscription.on('error', (error) => {
      ReactGA.event({
        category: 'Websocket',
        action: 'Error',
        label: 'Subscription'
      })
      emit(error)
    })
    const unsubscribe = () => {
      subscription.unsubscribe((error, success) => {
        if (error) {
          console.error(error)
        }
      })
    }
    return unsubscribe
  })
}

export function * subscribeToTransfer ({tokenAddress, accountAddress}) {
  const receiveTokenSubscription = web3Socket.eth.subscribe('logs', {
    address: tokenAddress,
    topics: [TRANSFER_EVENT, web3Utils.padLeft(accountAddress.toLowerCase(), 64)]
  }, identity)

  const sendTokenSubscription = web3Socket.eth.subscribe('logs', {
    address: tokenAddress,
    topics: [TRANSFER_EVENT, null, web3Utils.padLeft(accountAddress.toLowerCase(), 64)]
  }, identity)

  const receiveTokenChannel = yield call(createSubscriptionChannel, receiveTokenSubscription)
  const sendTokenChannel = yield call(createSubscriptionChannel, sendTokenSubscription)

  accountChannels.push(receiveTokenChannel)
  accountChannels.push(sendTokenChannel)

  yield put({
    type: actions.SUBSCRIBE_TO_TRANSFER.SUCCESS
  })

  while (true) {
    const payload = yield race([
      take(receiveTokenChannel),
      take(sendTokenChannel)
    ])

    yield put({type: BALANCE_OF.REQUEST,
      tokenAddress,
      accountAddress,
      blockNumber: payload.blockNumber
    })
  }
}

export function * subscribeToChange ({tokenAddress, marketMakerAddress}) {
  const subscription = web3Socket.eth.subscribe('logs', {
    address: marketMakerAddress,
    topics: [CHANGE_EVENT]
  }, identity)

  const subscriptionChannel = yield call(createSubscriptionChannel, subscription)

  yield put({
    type: actions.SUBSCRIBE_TO_CHANGE.SUCCESS
  })

  while (true) {
    const payload = yield take(subscriptionChannel)
    yield put(fetchMarketMakerData(tokenAddress, marketMakerAddress, payload.blockNumber))
  }
}

function clearAccountChannels () {
  for (let subscription of accountChannels) {
    subscription.close()
  }
  accountChannels = []
}

export function * watchAccountChanged ({response}) {
  const {accountAddress} = response
  clearAccountChannels()

  const addresses = yield select(getTokenAddresses)
  for (let tokenAddress of addresses) {
    yield put(actions.subscribeToTransfer(tokenAddress, accountAddress))
  }
}

export function * websocketOnError () {
  websocketProvider.on('error', (error) => {
    ReactGA.event({
      category: 'Websocket',
      action: 'Error',
      label: 'Connect'
    })
    console.error(error)
  })
}

export default function * subscriptionsSaga () {
  yield fork(websocketOnError)

  yield all([
    takeEvery(CHECK_ACCOUNT_CHANGED.SUCCESS, watchAccountChanged),
    tryTakeEvery(actions.SUBSCRIBE_TO_TRANSFER, subscribeToTransfer),
    tryTakeEvery(actions.SUBSCRIBE_TO_CHANGE, subscribeToChange)
  ])
}
