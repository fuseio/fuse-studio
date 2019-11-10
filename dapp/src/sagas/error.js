import { takeEvery } from 'redux-saga/effects'

function bubbleErrors (error) {
  if (CONFIG.env === 'qa') {
    console.error(error)
  }

  throw error
}

export default function * () {
  yield takeEvery(['ERROR'], bubbleErrors)
}
