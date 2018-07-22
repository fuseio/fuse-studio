import { all, call, put, select, take, takeEvery } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'

import * as actions from 'actions/websocket'
import {CHECK_ACCOUNT_CHANGED} from 'actions/web3'
import {BALANCE_OF} from 'actions/basicToken'
import web3, {web3Socket} from 'services/web3'
import {getAddresses} from 'selectors/web3'
import {getAccountAddress} from 'selectors/accounts'
import forEach from 'lodash/forEach'

const TRANSFER_EVENT = web3.utils.soliditySha3('Transfer(address,address,uint256)')


function createSubscriptionChannel (subscription) {
  return eventChannel(emit => {
    const dataHandler = (event) => {
      debugger
      emit(event)
    }

    const errorHandler = (error) => {
      debugger
      emit(error)
    }
    subscription.on('data', dataHandler)

    const unsubscribe = () => {
      subscription.on('error', errorHandler)
    }

    return unsubscribe
  })
}

export function * subscribe ({tokenAddress, topics}) {
  const subscription = web3Socket.eth.subscribe('logs', {
    address: tokenAddress,
    topics
  })
  const subscriptionChannel = yield call(createSubscriptionChannel, subscription)

  while (true) {
    const payload = yield take(subscriptionChannel)
    const accountAddress = yield select(getAccountAddress)

    yield put({type: BALANCE_OF.REQUEST,
      tokenAddress,
      accountAddress,
      blockNumber: payload.blockNumber
    })
  }
}

export function * watchAccountChanged ({response}) {
  const {accountAddress} = response
  const addresses = Object.values(yield select(getAddresses))

  for (let tokenAddress of addresses) {
    yield put({
      type: actions.SUBSCRIBE,
      tokenAddress,
      topics: [[TRANSFER_EVENT, web3.utils.padLeft(accountAddress.toLowerCase(), 64), null],
        [TRANSFER_EVENT, null, web3.utils.padLeft(accountAddress.toLowerCase(), 64), null]]
    })
  }
}

export default function * websocketSaga () {
  yield all([
    takeEvery(CHECK_ACCOUNT_CHANGED.SUCCESS, watchAccountChanged),
    takeEvery(actions.SUBSCRIBE, subscribe)
  ])
}
