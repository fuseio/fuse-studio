import { all, call, put, select, takeEvery } from 'redux-saga/effects'
import { getContract } from 'services/contract'
import { getAddress } from 'selectors/network'
import * as actions from 'actions/token'
import { DEPLOY_BRIDGE } from 'actions/bridge'
import { ADD_USER } from 'actions/user'
import { ADD_COMMUNITY_PLUGINS } from 'actions/community'
import { createMetadata } from 'sagas/metadata'
import { getAccountAddress } from 'selectors/accounts'
import * as api from 'services/api/token'
import { processReceipt } from 'services/api/misc'
import { transactionSucceeded } from 'actions/transactions'
import { apiCall, createEntityPut, tryTakeEvery, createEntitiesFetch } from './utils'
import { transactionFlow } from './transaction'
import MintableBurnableTokenAbi from 'constants/abi/MintableBurnableToken'
import { getWeb3 } from 'services/web3'
import {
  fetchCommunity as fetchCommunityApi,
  addCommunityPlugins as addCommunityPluginsApi
} from 'services/api/community'
import { ADD_ENTITY, REMOVE_ENTITY } from 'actions/communityEntities'
import { roles, combineRoles } from '@fuse/roles'
import { getCommunityAddress } from 'selectors/entities'
const { addresses: { funder: { address: funderAddress } } } = CONFIG.web3

const entityPut = createEntityPut(actions.entityName)

const fetchTokens = createEntitiesFetch(actions.FETCH_TOKENS, api.fetchTokens)
const fetchToken = createEntitiesFetch(actions.FETCH_TOKEN, api.fetchToken)
const fetchCommunity = createEntitiesFetch(actions.FETCH_COMMUNITY_DATA, fetchCommunityApi)
const fetchTokensByOwner = createEntitiesFetch(actions.FETCH_TOKENS_BY_OWNER, api.fetchTokensByOwner)

export const fetchTokenList = createEntitiesFetch(actions.FETCH_TOKEN_LIST, api.fetchTokenList)

function * fetchFuseToken () {
  const tokenAddress = yield select(getAddress, 'FuseToken')
  const FuseTokenContract = getContract({ abiName: 'FuseToken', address: tokenAddress })

  const calls = {
    name: call(FuseTokenContract.methods.name().call),
    symbol: call(FuseTokenContract.methods.symbol().call),
    totalSupply: call(FuseTokenContract.methods.totalSupply().call),
    owner: call(FuseTokenContract.methods.owner().call)
  }

  const response = yield all(calls)

  yield entityPut({ type: actions.FETCH_FUSE_TOKEN.SUCCESS,
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
  const foreignTokenAddress = receipt.events.TokenCreated.returnValues.token
  const { data: { _id: id } } = yield apiCall(api.deployChosenContracts, { steps: { ...steps, bridge: { args: { foreignTokenAddress } } } })
  yield put({
    type: actions.DEPLOY_TOKEN.SUCCESS,
    response: {
      id
    }
  })
}

function * deployExistingToken ({ steps }) {
  const { data: { _id } } = yield apiCall(api.deployChosenContracts, { steps })
  yield put({
    type: actions.DEPLOY_TOKEN.SUCCESS,
    response: {
      id: _id
    }
  })
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

function * fetchTokenProgress ({ communityAddress }) {
  const response = yield apiCall(api.fetchTokenProgress, { communityAddress })
  const { data: { steps, done = false } } = response
  const keys = Object.keys(steps)
    .reduce((obj, key) => ({
      ...obj,
      [key]: steps[key] && steps[key].done,
      transferOwnership: done,
      done
    }), {})

  const data = Object.keys(steps)
    .reduce((obj, key) => ({
      ...obj,
      ...steps[key] && steps[key].results
    }), {})

  yield put({
    type: actions.FETCH_TOKEN_PROGRESS.SUCCESS,
    response: {
      ...data,
      steps: { ...keys }
    }
  })

  return response
}

function * fetchDeployProgress ({ id }) {
  const response = yield apiCall(api.fetchDeployProgress, { id })
  const { data: { steps, done = false, communityAddress } } = response

  const stepErrors = Object.keys(steps)
    .reduce((obj, key) => ({
      ...obj,
      [key]: steps[key] && steps[key].error
    }), {})

  const keys = Object.keys(steps)
    .reduce((obj, key) => ({
      ...obj,
      [key]: steps[key] && steps[key].done,
      transferOwnership: done,
      done
    }), {})

  yield put({
    type: actions.FETCH_DEPLOY_PROGRESS.SUCCESS,
    communityAddress,
    response: {
      steps: { ...keys },
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
  const web3 = yield getWeb3()
  const contract = new web3.eth.Contract(MintableBurnableTokenAbi, tokenAddress)

  const transactionPromise = contract.methods.mint(accountAddress, value).send({
    from: accountAddress
  })

  const action = actions.MINT_TOKEN
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, tokenAddress })
}

function * burnToken ({ tokenAddress, value }) {
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
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

function * watchCommunityFetch ({ response }) {
  const { entities } = response
  for (const communityAddress in entities) {
    if (entities.hasOwnProperty(communityAddress)) {
      const { foreignTokenAddress } = entities[communityAddress]
      yield put(actions.fetchToken(foreignTokenAddress))
    }
  }
}

function * addCommunityPlugins ({ communityAddress, plugins, tokenAddress }) {
  const { data: { plugins: newPlugins } } = yield apiCall(addCommunityPluginsApi, { communityAddress, plugins })

  if (tokenAddress && plugins && plugins.joinBonus && plugins.joinBonus.isActive) {
    const adminMultiRole = combineRoles(roles.USER_ROLE, roles.ADMIN_ROLE, roles.APPROVED_ROLE)

    const accountAddress = yield select(getAccountAddress)
    const CommunityContract = getContract({ abiName: 'Community',
      address: communityAddress
    })
    const method = CommunityContract.methods.addEntity(funderAddress, adminMultiRole)
    const transactionPromise = method.send({
      from: accountAddress
    })
    const action = ADD_ENTITY
    yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
  } else if (tokenAddress && plugins && plugins.joinBonus && !plugins.joinBonus.isActive) {
    const accountAddress = yield select(getAccountAddress)
    const CommunityContract = getContract({ abiName: 'Community',
      address: communityAddress
    })
    const method = CommunityContract.methods.removeEntity(funderAddress)
    const transactionPromise = method.send({
      from: accountAddress
    })
    const action = REMOVE_ENTITY
    yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
  }

  yield put({
    type: ADD_COMMUNITY_PLUGINS.SUCCESS,
    communityAddress,
    response: {
      newPlugins
    }
  })
}

function * watchPluginsChanges () {
  const communityAddress = yield select(getCommunityAddress)
  yield put(actions.fetchCommunity(communityAddress))
}

function * transferTokenToFunder ({ tokenAddress, value }) {
  yield put(actions.transferToken(tokenAddress, funderAddress, value))
  const communityAddress = yield select(getCommunityAddress)
  yield apiCall(addCommunityPluginsApi, { communityAddress, plugins: { joinBonus: { hasTransferToFunder: true } } })
}

export default function * tokenSaga () {
  yield all([
    tryTakeEvery(ADD_COMMUNITY_PLUGINS, addCommunityPlugins, 1),
    tryTakeEvery(actions.TRANSFER_TOKEN, transferToken, 1),
    tryTakeEvery(actions.TRANSFER_TOKEN_TO_FUNDER, transferTokenToFunder, 1),
    tryTakeEvery(actions.MINT_TOKEN, mintToken, 1),
    tryTakeEvery(actions.BURN_TOKEN, burnToken, 1),
    tryTakeEvery(actions.FETCH_TOKENS, fetchTokens, 1),
    tryTakeEvery(actions.FETCH_TOKENS_BY_OWNER, fetchTokensByOwner, 1),
    tryTakeEvery(actions.FETCH_TOKEN_LIST, fetchTokenList, 1),
    tryTakeEvery(actions.FETCH_TOKEN, fetchToken, 1),
    tryTakeEvery(actions.FETCH_COMMUNITY_DATA, fetchCommunity, 1),
    takeEvery([ADD_COMMUNITY_PLUGINS.SUCCESS, actions.TRANSFER_TOKEN.SUCCESS], watchPluginsChanges),
    takeEvery([actions.FETCH_COMMUNITY_DATA.SUCCESS], watchCommunityFetch),
    tryTakeEvery(actions.FETCH_FUSE_TOKEN, fetchFuseToken),
    tryTakeEvery(actions.CREATE_TOKEN, createToken, 1),
    tryTakeEvery(actions.CREATE_TOKEN_WITH_METADATA, createTokenWithMetadata, 1),
    tryTakeEvery(actions.FETCH_TOKEN_STATISTICS, fetchTokenStatistics, 1),
    tryTakeEvery(actions.FETCH_TOKEN_PROGRESS, fetchTokenProgress, 1),
    takeEvery([DEPLOY_BRIDGE.SUCCESS, ADD_USER.SUCCESS], fetchTokenProgress),
    takeEvery([actions.MINT_TOKEN.SUCCESS, actions.BURN_TOKEN.SUCCESS], watchTokenChanges),
    takeEvery(actions.CREATE_TOKEN_WITH_METADATA.SUCCESS, deployChosenContracts),
    tryTakeEvery(actions.DEPLOY_EXISTING_TOKEN, deployExistingToken),
    tryTakeEvery(actions.FETCH_DEPLOY_PROGRESS, fetchDeployProgress)
  ])
}
