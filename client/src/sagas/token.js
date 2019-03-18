import { all, call, put, select, takeEvery } from 'redux-saga/effects'

import {getContract} from 'services/contract'
import {getAddress} from 'selectors/network'
import * as actions from 'actions/token'
import {fetchMetadata} from 'actions/metadata'
import {DEPLOY_BRIDGE} from 'actions/bridge'
import {ADD_USER} from 'actions/user'
import {createMetadata} from 'sagas/metadata'
import {getAccountAddress} from 'selectors/accounts'
import * as api from 'services/api/token'
import {processReceipt} from 'services/api/misc'
import {transactionSucceeded} from 'actions/utils'
import {apiCall, createEntityPut, tryTakeEvery, createEntitiesFetch} from './utils'
import {transactionFlow} from './transaction'

const entityPut = createEntityPut(actions.entityName)

const fetchTokens = createEntitiesFetch(actions.FETCH_TOKENS, api.fetchTokens)
const fetchTokensByOwner = createEntitiesFetch(actions.FETCH_TOKENS_BY_OWNER, api.fetchTokensByOwner)
export const fetchTokensByAccount = createEntitiesFetch(actions.FETCH_TOKENS_BY_ACCOUNT, api.fetchTokensByAccount)

function * fetchToken ({tokenAddress}) {
  const response = yield apiCall(api.fetchToken, {tokenAddress})
  const token = response.data

  yield put(fetchMetadata(token.tokenURI, tokenAddress))

  yield entityPut({
    type: actions.FETCH_TOKEN.SUCCESS,
    tokenAddress,
    response: token
  })
}

function * fetchClnToken () {
  const tokenAddress = yield select(getAddress, 'ColuLocalNetwork')
  const ColuLocalNetworkContract = getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})

  const calls = {
    name: call(ColuLocalNetworkContract.methods.name().call),
    symbol: call(ColuLocalNetworkContract.methods.symbol().call),
    totalSupply: call(ColuLocalNetworkContract.methods.totalSupply().call),
    owner: call(ColuLocalNetworkContract.methods.owner().call)
  }

  const response = yield all(calls)
  response.address = tokenAddress

  yield entityPut({type: actions.FETCH_CLN_TOKEN.SUCCESS,
    tokenAddress,
    response
  })
}

export function * createToken ({name, symbol, totalSupply, tokenURI}) {
  const tokenFactoryAddress = yield select(getAddress, 'TokenFactory')

  const TokenFactoryContract = getContract({abiName: 'TokenFactory',
    address: tokenFactoryAddress
  })
  const accountAddress = yield select(getAccountAddress)

  const transactionPromise = TokenFactoryContract.methods.createToken(
    name,
    symbol,
    totalSupply.toFixed(),
    tokenURI
  ).send({
    from: accountAddress
  })
  const receipt = yield transactionFlow({transactionPromise, action: actions.CREATE_TOKEN})

  return receipt
}

function * createTokenWithMetadata ({tokenData, metadata}) {
  const {hash} = yield call(createMetadata, {metadata})
  const tokenURI = `ipfs://${hash}`
  const receipt = yield call(createToken, {...tokenData, tokenURI})

  yield apiCall(processReceipt, {receipt})

  yield put(transactionSucceeded(actions.CREATE_TOKEN_WITH_METADATA, receipt))
}

function * fetchTokenStatistics ({tokenAddress, activityType, interval}) {
  const response = yield apiCall(api.fetchTokenStatistics, {tokenAddress, activityType, interval})

  const {data} = response

  yield put({
    type: actions.FETCH_TOKEN_STATISTICS.SUCCESS,
    response: {
      [activityType]: data
    }
  })
}

function * fetchTokenProgress ({tokenAddress}) {
  const response = yield apiCall(api.fetchTokenProgress, {tokenAddress})

  yield put({
    type: actions.FETCH_TOKEN_PROGRESS.SUCCESS,
    tokenAddress,
    response: {
      steps: response.data.steps
    }
  })
}

export default function * tokenSaga () {
  yield all([
    tryTakeEvery(actions.FETCH_TOKENS, fetchTokens, 1),
    tryTakeEvery(actions.FETCH_TOKENS_BY_OWNER, fetchTokensByOwner, 1),
    tryTakeEvery(actions.FETCH_TOKENS_BY_ACCOUNT, fetchTokensByAccount, 1),
    tryTakeEvery(actions.FETCH_TOKEN, fetchToken, 1),
    tryTakeEvery(actions.FETCH_CLN_TOKEN, fetchClnToken),
    tryTakeEvery(actions.CREATE_TOKEN, createToken, 1),
    tryTakeEvery(actions.CREATE_TOKEN_WITH_METADATA, createTokenWithMetadata, 1),
    tryTakeEvery(actions.FETCH_TOKEN_STATISTICS, fetchTokenStatistics, 1),
    tryTakeEvery(actions.FETCH_TOKEN_PROGRESS, fetchTokenProgress, 1),
    takeEvery(DEPLOY_BRIDGE.SUCCESS, fetchTokenProgress),
    takeEvery(ADD_USER.SUCCESS, fetchTokenProgress)
  ])
}
