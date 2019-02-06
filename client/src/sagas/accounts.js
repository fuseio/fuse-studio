import { all, put, call, takeEvery, select } from 'redux-saga/effects'
import { contract } from 'osseus-wallet'

import * as actions from 'actions/accounts'
import {apiCall, tryTakeEvery} from './utils'
import {getClnAddress, getNetworkType} from 'selectors/network'
import {addUserInformation as addUserInformationApi} from 'services/api/misc'
import {CHECK_ACCOUNT_CHANGED} from 'actions/network'
import {fetchTokensByAccount} from 'sagas/token'
import web3 from 'services/web3'
import {getAccountAddress} from 'selectors/accounts'

function * addUserInformation ({user}) {
  const accountAddress = yield select(getAccountAddress)
  const response = yield apiCall(addUserInformationApi, {user: {...user, accountAddress}}, {auth: true})
  const {data} = response
  yield put({
    type: actions.ADD_USER_INFORMATION.SUCCESS,
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
    tryTakeEvery(actions.ADD_USER_INFORMATION, addUserInformation, 1),
    tryTakeEvery(actions.FETCH_TOKENS_WITH_BALANCES, fetchTokensWithBalances, 1)
  ])
}
