import { all, put, call, takeEvery, select } from 'redux-saga/effects'

import * as actions from 'actions/accounts'
import {tryTakeEvery} from './utils'
import {getAddress, getNetworkType} from 'selectors/network'
import {CHECK_ACCOUNT_CHANGED} from 'actions/network'
import {fetchTokensByAccount} from 'sagas/token'
import web3 from 'services/web3'
import {getContract} from 'services/contract'

function * balanceOfToken ({tokenAddress, accountAddress, options}) {
  const basicTokenContract = getContract({abiName: 'BasicToken', address: tokenAddress, options})
  const balanceOf = yield call(basicTokenContract.methods.balanceOf(accountAddress).call)

  yield put({type: actions.BALANCE_OF_TOKEN.SUCCESS,
    tokenAddress,
    accountAddress,
    response: {
      balanceOf
    }}
  )
}

function * balanceOfNative ({accountAddress}) {
  const balanceOfNative = yield call(web3.eth.getBalance, accountAddress)

  yield put({type: actions.BALANCE_OF_NATIVE.SUCCESS,
    accountAddress,
    response: {
      balanceOfNative
    }})
}

function * balanceOfCln ({accountAddress}) {
  const networkType = yield select(getNetworkType)
  if (networkType === 'fuse') {
    yield call(balanceOfNative, {accountAddress})
  } else {
    const tokenAddress = yield select(getAddress, 'ColuLocalNetwork')
    yield call(balanceOfToken, {tokenAddress, accountAddress})
  }
}

function * fetchBalances ({accountAddress, tokens}) {
  for (let token of tokens) {
    yield put(actions.balanceOfToken(token.address, accountAddress))
  }
}

function * fetchTokensWithBalances ({accountAddress}) {
  const tokens = yield call(fetchTokensByAccount, {accountAddress, entity: 'tokens'})
  yield call(fetchBalances, {accountAddress, tokens})
}

function * watchAccountChanged ({response}) {
  yield put(actions.balanceOfCln(response.accountAddress))
}

export default function * accountsSaga () {
  yield all([
    tryTakeEvery(actions.BALANCE_OF_TOKEN, balanceOfToken),
    tryTakeEvery(actions.BALANCE_OF_NATIVE, balanceOfNative),
    tryTakeEvery(actions.BALANCE_OF_CLN, balanceOfCln),
    takeEvery(CHECK_ACCOUNT_CHANGED.SUCCESS, watchAccountChanged),
    tryTakeEvery(actions.FETCH_BALANCES, fetchBalances, 1),
    tryTakeEvery(actions.FETCH_TOKENS_WITH_BALANCES, fetchTokensWithBalances, 1)
  ])
}
