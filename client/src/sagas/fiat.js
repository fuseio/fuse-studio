import { all, put, takeEvery } from 'redux-saga/effects'

import * as actions from 'actions/fiat'
import * as api from 'services/api'

function * fetchTokenQuote ({symbol, currency}) {
  const response = yield api.fetchTokenQuote(symbol, currency)

  const quote = response.data.quotes[currency]
  yield put({
    type: actions.FETCH_TOKEN_QUOTE.SUCCESS,
    response: {[currency]: quote}
  })
}

export default function * pricesSaga () {
  yield all([
    takeEvery(actions.FETCH_TOKEN_QUOTE.REQUEST, fetchTokenQuote)
  ])
}
