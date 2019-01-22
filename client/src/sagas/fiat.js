import { all, put } from 'redux-saga/effects'
import {tryTakeEvery} from './utils'
import * as actions from 'actions/fiat'
import * as api from 'services/api/misc'

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
    tryTakeEvery(actions.FETCH_TOKEN_QUOTE, fetchTokenQuote)
  ])
}
