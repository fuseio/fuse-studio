import { all, put, call, takeEvery, select } from 'redux-saga/effects'
import { contract } from 'osseus-wallet'

import * as actions from 'actions/accounts'
import {tryTakeEvery} from './utils'
import {getAddresses, getCommunityAddresses} from 'selectors/network'
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

function * updateBalances ({accountAddress}) {
  const addresses = yield select(getAddresses)
  const communityAddresses = yield select(getCommunityAddresses)
  if (addresses) {
    yield put({type: actions.BALANCE_OF.REQUEST, tokenAddress: addresses.ColuLocalNetwork, accountAddress})
    for (let communityAddress of communityAddresses) {
      yield put({type: actions.BALANCE_OF.REQUEST, tokenAddress: communityAddress, accountAddress})
    }
  }
}

export function * watchAccountChanged ({response}) {
  yield put({
    type: actions.UPDATE_BALANCES.REQUEST,
    accountAddress: response.accountAddress
  })
}

export default function * accountsSaga () {
  yield all([
    tryTakeEvery(actions.BALANCE_OF, balanceOf),
    tryTakeEvery(actions.UPDATE_BALANCES, updateBalances),
    takeEvery(CHECK_ACCOUNT_CHANGED.SUCCESS, watchAccountChanged)
  ])
}
