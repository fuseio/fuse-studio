import { all, put, call, takeEvery, select } from 'redux-saga/effects'
import { contract } from 'osseus-wallet'

import * as actions from 'actions/accounts'
import {tryTakeEvery, apiCall} from './utils'
import {getClnAddress, getNetworkType} from 'selectors/network'
import {fetchTokensByAccount as fetchTokensByAccountApi} from 'services/api/communities'
import {addUserInformation} from 'services/api/misc'
import {CHECK_ACCOUNT_CHANGED} from 'actions/network'
import web3 from 'services/web3'

function * setUserInformation ({user}) {
  const response = yield call(addUserInformation, user)
  const data = response.data
  yield put({
    type: actions.SET_USER_INFORMATION.SUCCESS,
    user,
    response: {
      data
    }
  })
}

function * balanceOfToken ({tokenAddress, accountAddress, blockNumber}) {
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: tokenAddress})
  const balanceOf = yield call(ColuLocalNetworkContract.methods.balanceOf(accountAddress).call)

  yield put({type: actions.BALANCE_OF_TOKEN.SUCCESS,
    tokenAddress,
    accountAddress,
    response: {
      balanceOf
    }})
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
    const tokenAddress = yield select(getClnAddress)
    yield call(balanceOfToken, {tokenAddress, accountAddress})
  }
}

function * fetchTokensByAccount ({accountAddress}) {
  const response = yield apiCall(fetchTokensByAccountApi, accountAddress)
  const tokens = response.data
  yield put({
    type: actions.FETCH_TOKENS_BY_ACCOUNT.SUCCESS,
    accountAddress,
    response: {
      tokens
    }
  })
  return tokens
}

function * fetchBalances ({accountAddress, tokens}) {
  for (let token of tokens) {
    yield put(actions.balanceOfToken(token.address, accountAddress))
  }
}

function * fetchTokensWithBalances ({accountAddress}) {
  const tokens = yield call(fetchTokensByAccount, {accountAddress})
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
    takeEvery(actions.FETCH_TOKENS_BY_ACCOUNT.REQUEST, fetchTokensByAccount),
    takeEvery(CHECK_ACCOUNT_CHANGED.SUCCESS, watchAccountChanged),
    tryTakeEvery(actions.FETCH_BALANCES, fetchBalances, 1),
    tryTakeEvery(actions.SET_USER_INFORMATION, setUserInformation, 1),
    tryTakeEvery(actions.FETCH_TOKENS_WITH_BALANCES, fetchTokensWithBalances, 1)
  ])
}
