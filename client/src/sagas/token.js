import { all, call, put, select } from 'redux-saga/effects'
import keyBy from 'lodash/keyBy'
import { contract } from 'osseus-wallet'

import {getAddresses, getClnAddress} from 'selectors/network'
import * as actions from 'actions/token'
import {fetchMetadata} from 'actions/metadata'
import {createMetadata} from 'sagas/metadata'
import {getAccountAddress} from 'selectors/accounts'
import * as api from 'services/api/token'
import {processReceipt} from 'services/api/misc'
import {transactionPending, transactionFailed, transactionSucceeded} from 'actions/utils'
import {apiCall, createEntityPut, tryTakeEvery} from './utils'

const entityPut = createEntityPut(actions.entityName)

function * fetchTokens ({page = 1}) {
  const response = yield apiCall(api.fetchTokens, page)
  const {data, ...metadata} = response
  const tokens = data

  const entities = keyBy(tokens, 'address')
  const result = Object.keys(entities)

  yield entityPut({type: actions.FETCH_TOKENS.SUCCESS,
    response: {
      entities,
      result,
      metadata
    }})

  for (let token of tokens) {
    yield put(fetchMetadata(token.tokenURI, token.address))
  }

  return tokens
}

function * fetchTokensByOwner ({owner}) {
  const response = yield apiCall(api.fetchTokensByOwner, owner)
  const {data, ...metadata} = response
  const tokens = data

  const entities = keyBy(tokens, 'address')
  const result = Object.keys(entities)

  yield entityPut({type: actions.FETCH_TOKENS_BY_OWNER.SUCCESS,
    response: {
      entities,
      result,
      metadata
    }})

  for (let token of tokens) {
    yield put(fetchMetadata(token.tokenURI, token.address))
  }

  return tokens
}

function * fetchTokenWithData ({tokenAddress}) {
  const response = yield apiCall(api.fetchToken, tokenAddress)
  const token = response.data

  yield put(fetchMetadata(token.tokenURI, tokenAddress))

  yield entityPut({
    type: actions.FETCH_TOKEN_WITH_DATA.SUCCESS,
    tokenAddress,
    response: token
  })
}

function * fetchClnToken () {
  const tokenAddress = yield select(getClnAddress)
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})

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
  const addresses = yield select(getAddresses)
  const TokenFactoryContract = contract.getContract({abiName: 'TokenFactory',
    address: addresses.TokenFactory
  })
  const accountAddress = yield select(getAccountAddress)

  const createTokenPromise = TokenFactoryContract.methods.createToken(
    name,
    symbol,
    totalSupply,
    tokenURI
  ).send({
    from: accountAddress
  })

  const transactionHash = yield new Promise((resolve, reject) => {
    createTokenPromise.on('transactionHash', (transactionHash) =>
      resolve(transactionHash)
    )
    createTokenPromise.on('error', (error) =>
      reject(error)
    )
  })

  yield put(transactionPending(actions.CREATE_TOKEN, transactionHash))

  const receipt = yield createTokenPromise

  if (!Number(receipt.status)) {
    yield put(transactionFailed(actions.CREATE_TOKEN, receipt))
    return receipt
  }

  yield put(transactionSucceeded(actions.CREATE_TOKEN, receipt))

  return receipt
}

function * createTokenWithMetadata ({tokenData, metadata}) {
  const {hash, protocol} = yield call(createMetadata, {metadata})
  const tokenURI = `${protocol}://${hash}`
  const receipt = yield call(createToken, {...tokenData, tokenURI})

  yield apiCall(processReceipt, receipt)

  const owner = yield select(getAccountAddress)
  yield put({
    type: actions.FETCH_TOKENS_BY_OWNER.REQUEST,
    owner
  })

  const tokenAddress = receipt.events.TokenCreated.returnValues.token

  yield entityPut({
    type: actions.CREATE_TOKEN_WITH_METADATA.SUCCESS,
    tokenAddress
  })
}

function * fetchTokenStatistics ({tokenAddress, activityType, interval}) {
  const response = yield apiCall(api.fetchTokenStatistics, tokenAddress, activityType, interval)

  const {data} = response

  yield put({
    type: actions.FETCH_TOKEN_STATISTICS.SUCCESS,
    response: {
      [activityType]: data
    }
  })
}

export default function * marketMakerSaga () {
  yield all([
    tryTakeEvery(actions.FETCH_TOKENS, fetchTokens, 1),
    tryTakeEvery(actions.FETCH_TOKENS_BY_OWNER, fetchTokensByOwner, 1),
    tryTakeEvery(actions.FETCH_TOKEN_WITH_DATA, fetchTokenWithData, 1),
    tryTakeEvery(actions.FETCH_CLN_TOKEN, fetchClnToken),
    tryTakeEvery(actions.CREATE_TOKEN, createToken, 1),
    tryTakeEvery(actions.CREATE_TOKEN_WITH_METADATA, createTokenWithMetadata, 1),
    tryTakeEvery(actions.FETCH_TOKEN_STATISTICS, fetchTokenStatistics, 1)
  ])
}
