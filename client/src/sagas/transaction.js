import { call, put, fork, take } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'

import {transactionPending, transactionFailed, transactionSucceeded} from 'actions/utils'

export function * transactionFlow ({transactionPromise, action, confirmationsLimit}) {
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
  let response
  while (isWaiting) {
    response = yield take(confirmationChannel)
    yield put({ type: action.CONFIRMATION, response })
    if (response.confirmationNumber > confirmationsLimit) {
      confirmationChannel.close()
      isWaiting = false
    }
  }
}
