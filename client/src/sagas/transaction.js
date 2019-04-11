import { call, put, fork, take } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import {processReceipt} from 'services/api/misc'
import {apiCall} from './utils'

import {transactionPending, transactionConfirmed, transactionFailed, transactionSucceeded} from 'actions/transactions'

export function * transactionFlow ({transactionPromise, action, confirmationsLimit, sendReceipt}) {
  if (confirmationsLimit) {
    yield fork(transactionConfirmations, {transactionPromise, action, confirmationsLimit})
  }

  const transactionHash = yield new Promise((resolve, reject) => {
    transactionPromise.on('transactionHash', (transactionHash) =>
      resolve(transactionHash)
    )
    transactionPromise.on('error', (error) =>
      reject(error)
    )
  })

  yield put(transactionPending(action, transactionHash))

  const receipt = yield transactionPromise

  if (!Number(receipt.status)) {
    yield put(transactionFailed(action, receipt))
    return receipt
  }

  if (sendReceipt) {
    yield apiCall(processReceipt, {receipt})
  }

  yield put(transactionSucceeded(action, receipt))

  return receipt
}

function createConfirmationChannel (transactionPromise) {
  return eventChannel(emit => {
    const func = (confirmationNumber, receipt) => {
      emit({receipt, confirmationNumber})
    }

    const emitter = transactionPromise.on('confirmation', func)

    const unsubscribe = () => {
      emitter.off('confirmation')
    }
    return unsubscribe
  })
}

export function * transactionConfirmations ({confirmationsLimit, transactionPromise, action}) {
  const confirmationChannel = yield call(createConfirmationChannel, transactionPromise)

  let isWaiting = true
  while (isWaiting) {
    const {receipt, confirmationNumber} = yield take(confirmationChannel)
    yield put(transactionConfirmed(action, receipt, confirmationNumber))
    if (confirmationNumber > confirmationsLimit) {
      confirmationChannel.close()
      isWaiting = false
    }
  }
}
