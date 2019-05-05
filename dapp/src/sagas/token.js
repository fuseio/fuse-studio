import { all, call, put, select, takeEvery } from 'redux-saga/effects'
import { getContract } from 'services/contract'
import { getAddress } from 'selectors/network'
import * as actions from 'actions/token'
import { DEPLOY_BRIDGE } from 'actions/bridge'
import { ADD_USER } from 'actions/user'
import { CREATE_LIST } from 'actions/directory'
import { createMetadata } from 'sagas/metadata'
import { getAccountAddress } from 'selectors/accounts'
import * as api from 'services/api/token'
import { processReceipt } from 'services/api/misc'
import { transactionSucceeded } from 'actions/transactions'
import { apiCall, createEntityPut, tryTakeEvery, createEntitiesFetch } from './utils'
import { transactionFlow } from './transaction'
import MintableBurnableTokenAbi from 'constants/abi/MintableBurnableToken'
import web3 from 'services/web3'

const entityPut = createEntityPut(actions.entityName)

const fetchTokens = createEntitiesFetch(actions.FETCH_TOKENS, api.fetchTokens)
const fetchToken = createEntitiesFetch(actions.FETCH_TOKEN, api.fetchToken)
const fetchTokensByOwner = createEntitiesFetch(actions.FETCH_TOKENS_BY_OWNER, api.fetchTokensByOwner)

export const fetchTokenList = createEntitiesFetch(actions.FETCH_TOKEN_LIST, api.fetchTokenList)

function * fetchClnToken () {
  const tokenAddress = yield select(getAddress, 'ColuLocalNetwork')
  const ColuLocalNetworkContract = getContract({ abiName: 'ColuLocalNetwork', address: tokenAddress })

  const calls = {
    name: call(ColuLocalNetworkContract.methods.name().call),
    symbol: call(ColuLocalNetworkContract.methods.symbol().call),
    totalSupply: call(ColuLocalNetworkContract.methods.totalSupply().call),
    owner: call(ColuLocalNetworkContract.methods.owner().call)
  }

  const response = yield all(calls)

  yield entityPut({ type: actions.FETCH_CLN_TOKEN.SUCCESS,
    address: tokenAddress,
    response: {
      ...response,
      address: tokenAddress
    }
  })
}

export function * createToken ({ name, symbol, totalSupply, tokenURI, tokenType }) {
  const tokenFactoryAddress = yield select(getAddress, 'TokenFactory')

  const TokenFactoryContract = getContract({ abiName: 'TokenFactory',
    address: tokenFactoryAddress
  })
  const accountAddress = yield select(getAccountAddress)

  if (tokenType === 'basic') {
    const transactionPromise = TokenFactoryContract.methods.createBasicToken(
      name,
      symbol,
      totalSupply.toFixed(),
      tokenURI
    ).send({
      from: accountAddress
    })
    const receipt = yield transactionFlow({ transactionPromise, action: actions.CREATE_TOKEN })

    return receipt
  } else if (tokenType === 'mintableBurnable') {
    const transactionPromise = TokenFactoryContract.methods.createMintableBurnableToken(
      name,
      symbol,
      totalSupply.toFixed(),
      tokenURI
    ).send({
      from: accountAddress
    })
    const receipt = yield transactionFlow({ transactionPromise, action: actions.CREATE_TOKEN })

    return receipt
  }
}

function * createTokenWithMetadata ({ tokenData, metadata, tokenType, steps }) {
  const { hash } = yield call(createMetadata, { metadata })
  const tokenURI = `ipfs://${hash}`
  const receipt = yield call(createToken, { ...tokenData, tokenURI, tokenType })

  yield apiCall(processReceipt, { receipt })

  yield put(transactionSucceeded(actions.CREATE_TOKEN_WITH_METADATA, receipt, { steps }))
}

function * deployChosenContracts ({ response: { steps, receipt } }) {
  const tokenAddress = receipt.events[0].address
  yield apiCall(api.deployChosenContracts, { tokenAddress, steps })
}

function * fetchTokenStatistics ({ tokenAddress, activityType, interval }) {
  const response = yield apiCall(api.fetchTokenStatistics, { tokenAddress, activityType, interval })

  const { data } = response

  yield put({
    type: actions.FETCH_TOKEN_STATISTICS.SUCCESS,
    response: {
      [activityType]: data
    }
  })
}

function * fetchTokenProgress ({ tokenAddress }) {
  const response = yield apiCall(api.fetchTokenProgress, { tokenAddress })

  yield put({
    type: actions.FETCH_TOKEN_PROGRESS.SUCCESS,
    tokenAddress,
    response: {
      steps: response.data.steps
    }
  })
}

function * fetchDeployProgress ({ tokenAddress }) {
  const response = yield apiCall(api.fetchTokenProgress, { tokenAddress: tokenAddress.tokenAddress })

  const { data } = response
  const { steps, stepErrors } = data

  yield put({
    type: actions.FETCH_DEPLOY_PROGRESS.SUCCESS,
    response: {
      tokenAddress: tokenAddress.tokenAddress,
      steps,
      stepErrors
    }
  })
}

function * transferToken ({ tokenAddress, to, value }) {
  const accountAddress = yield select(getAccountAddress)
  const contract = getContract({ abiName: 'BasicToken', address: tokenAddress })

  const transactionPromise = contract.methods.transfer(to, value).send({
    from: accountAddress
  })

  const action = actions.TRANSFER_TOKEN
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, tokenAddress })
}

function * mintToken ({ tokenAddress, value }) {
  const accountAddress = yield select(getAccountAddress)
  const contract = new web3.eth.Contract(MintableBurnableTokenAbi, tokenAddress)

  const transactionPromise = contract.methods.mint(accountAddress, value).send({
    from: accountAddress
  })

  const action = actions.MINT_TOKEN
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, tokenAddress })
}

function * burnToken ({ tokenAddress, value }) {
  const accountAddress = yield select(getAccountAddress)
  const contract = new web3.eth.Contract(MintableBurnableTokenAbi, tokenAddress)

  const transactionPromise = contract.methods.burn(value).send({
    from: accountAddress
  })

  const action = actions.BURN_TOKEN
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, tokenAddress })
}

function * watchTokenChanges ({ response }) {
  yield put(actions.fetchToken(response.tokenAddress))
}

export default function * tokenSaga () {
  yield all([
    tryTakeEvery(actions.TRANSFER_TOKEN, transferToken, 1),
    tryTakeEvery(actions.MINT_TOKEN, mintToken, 1),
    tryTakeEvery(actions.BURN_TOKEN, burnToken, 1),
    tryTakeEvery(actions.FETCH_TOKENS, fetchTokens, 1),
    tryTakeEvery(actions.FETCH_TOKENS_BY_OWNER, fetchTokensByOwner, 1),
    tryTakeEvery(actions.FETCH_TOKEN_LIST, fetchTokenList, 1),
    tryTakeEvery(actions.FETCH_TOKEN, fetchToken, 1),
    tryTakeEvery(actions.FETCH_CLN_TOKEN, fetchClnToken),
    tryTakeEvery(actions.CREATE_TOKEN, createToken, 1),
    tryTakeEvery(actions.CREATE_TOKEN_WITH_METADATA, createTokenWithMetadata, 1),
    tryTakeEvery(actions.FETCH_TOKEN_STATISTICS, fetchTokenStatistics, 1),
    tryTakeEvery(actions.FETCH_TOKEN_PROGRESS, fetchTokenProgress, 1),
    takeEvery([DEPLOY_BRIDGE.SUCCESS, ADD_USER.SUCCESS, CREATE_LIST.SUCCESS], fetchTokenProgress),
    takeEvery([actions.MINT_TOKEN.SUCCESS, actions.BURN_TOKEN.SUCCESS], watchTokenChanges),
    takeEvery(actions.CREATE_TOKEN_WITH_METADATA.SUCCESS, deployChosenContracts),
    tryTakeEvery(actions.FETCH_DEPLOY_PROGRESS, fetchDeployProgress)
  ])
}
