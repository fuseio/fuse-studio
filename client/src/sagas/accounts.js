import { all, put, call, takeEvery, select } from 'redux-saga/effects'
import { contract } from 'osseus-wallet'

import * as actions from 'actions/accounts'
import {tryTakeEvery} from './utils'
import {getClnAddress} from 'selectors/network'
import {CHECK_ACCOUNT_CHANGED} from 'actions/network'

function * balanceOf ({tokenAddress, accountAddress, blockNumber}) {
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: tokenAddress})
  const balanceOf = yield call(ColuLocalNetworkContract.methods.balanceOf(accountAddress).call, null, blockNumber)

  yield put({type: actions.BALANCE_OF.SUCCESS,
    tokenAddress,
    accountAddress,
    response: {
      balanceOf
    }})
}

export function * balanceOfCln ({accountAddress}) {
  const tokenAddress = yield select(getClnAddress)
  yield call(balanceOf, {tokenAddress, accountAddress})
}

export function * watchAccountChanged ({response}) {
  yield put(actions.balanceOfCln(response.accountAddress))
}

export default function * accountsSaga () {
  yield all([
    tryTakeEvery(actions.BALANCE_OF, balanceOf),
    tryTakeEvery(actions.BALANCE_OF_CLN, balanceOfCln),
    takeEvery(CHECK_ACCOUNT_CHANGED.SUCCESS, watchAccountChanged)
  ])
}
