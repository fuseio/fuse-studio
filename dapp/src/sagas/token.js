import { all, call, put, select, takeEvery } from 'redux-saga/effects'
import BasicToken from '@fuse/token-factory-contracts/abi/BasicToken'
import { getAddress } from 'selectors/network'
import * as actions from 'actions/token'
import { balanceOfToken } from 'actions/accounts'
import { DEPLOY_BRIDGE } from 'actions/bridge'
import { fetchMetadata } from 'actions/metadata'
import { ADD_COMMUNITY_PLUGIN, TOGGLE_JOIN_BONUS } from 'actions/community'
import { createMetadata } from 'sagas/metadata'
import { getAccountAddress } from 'selectors/accounts'
import * as api from 'services/api/token'
import { transactionSucceeded } from 'actions/transactions'
import { apiCall, createEntityPut, tryTakeEvery, createEntitiesFetch } from './utils'
import { transactionFlow } from './transaction'
import MintableBurnableTokenAbi from 'constants/abi/MintableBurnableToken'
import { getWeb3 } from 'services/web3'
import {
  fetchCommunity as fetchCommunityApi,
  addCommunityPlugin as addCommunityPluginApi
} from 'services/api/community'
import { ADD_ENTITY, REMOVE_ENTITY } from 'actions/communityEntities'
import { roles, combineRoles } from '@fuse/roles'
import { getCommunityAddress } from 'selectors/entities'
import get from 'lodash/get'
import TokenFactoryABI from '@fuse/token-factory-contracts/abi/TokenFactoryWithEvents'
import CommunityABI from '@fuse/entities-contracts/abi/CommunityWithEvents'
import { getOptions, getNetworkVersion } from 'utils/network'
import FuseTokenABI from 'constants/abi/FuseToken'
const { addresses: { fuse: { funder: funderAddress } } } = CONFIG.web3

const entityPut = createEntityPut(actions.entityName)

const fetchTokens = createEntitiesFetch(actions.FETCH_TOKENS, api.fetchTokens)
const fetchToken = createEntitiesFetch(actions.FETCH_TOKEN, api.fetchToken)
const fetchCommunity = createEntitiesFetch(actions.FETCH_COMMUNITY_DATA, fetchCommunityApi)
const fetchTokensByOwner = createEntitiesFetch(actions.FETCH_TOKENS_BY_OWNER, api.fetchTokensByOwner)
const fetchFeaturedCommunities = createEntitiesFetch(actions.FETCH_FEATURED_COMMUNITIES, api.fetchFeaturedCommunities)

function * fetchFuseToken () {
  const tokenAddress = yield select(getAddress, 'FuseToken')
  const web3 = yield getWeb3()
  const FuseTokenContract = new web3.eth.Contract(FuseTokenABI, tokenAddress)

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
  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const TokenFactoryContract = new web3.eth.Contract(TokenFactoryABI, tokenFactoryAddress, getOptions(networkVersion))

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
    const receipt = yield transactionFlow({ transactionPromise, action: actions.CREATE_TOKEN, sendReceipt: true, abiName: 'TokenFactory' })

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
    const receipt = yield transactionFlow({ transactionPromise, action: actions.CREATE_TOKEN, sendReceipt: true, abiName: 'TokenFactory' })

    return receipt
  }
}

function * createTokenWithMetadata ({ tokenData, metadata, tokenType, steps }) {
  const { hash } = yield call(createMetadata, { metadata })
  const tokenURI = `ipfs://${hash}`
  const receipt = yield call(createToken, { ...tokenData, tokenURI, tokenType })
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

function * deployExistingToken ({ steps, metadata }) {
  const { hash } = yield call(createMetadata, { metadata })
  const communityURI = `ipfs://${hash}`
  const newSteps = { ...steps, community: { ...steps.community, args: { ...steps.community.args, communityURI } } }
  const { data: { _id } } = yield apiCall(api.deployChosenContracts, { steps: newSteps })
  yield put({
    type: actions.DEPLOY_TOKEN.SUCCESS,
    response: {
      id: _id
    }
  })
}

function * fetchTokenProgress ({ communityAddress }) {
  const response = yield apiCall(api.fetchTokenProgress, { communityAddress })
  const { data: { steps, done = false } } = response
  const keys = Object.keys(steps)
    .reduce((obj, key) => ({
      ...obj,
      [key]: get(steps, `${[key]}.done`, false),
      transferOwnership: done,
      done
    }), {})

  const data = Object.keys(steps)
    .reduce((obj, key) => ({
      ...obj,
      ...get(steps, `${[key]}.results`)
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
      [key]: get(steps, `${[key]}.error`)
    }), {})

  const keys = Object.keys(steps)
    .reduce((obj, key) => ({
      ...obj,
      [key]: get(steps, `${[key]}.done`, false),
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
  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const contract = new web3.eth.Contract(BasicToken, tokenAddress, getOptions(networkVersion))

  const transactionPromise = contract.methods.transfer(to, value).send({
    from: accountAddress
  })

  const action = actions.TRANSFER_TOKEN
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, tokenAddress })
}

function * mintToken ({ tokenAddress, value }) {
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const contract = new web3.eth.Contract(MintableBurnableTokenAbi, tokenAddress, getOptions(networkVersion))

  const transactionPromise = contract.methods.mint(accountAddress, value).send({
    from: accountAddress
  })

  const action = actions.MINT_TOKEN
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, tokenAddress, abiName: 'MintableBurnableToken' })
}

function * burnToken ({ tokenAddress, value }) {
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const contract = new web3.eth.Contract(MintableBurnableTokenAbi, tokenAddress, getOptions(networkVersion))

  const transactionPromise = contract.methods.burn(value).send({
    from: accountAddress
  })

  const action = actions.BURN_TOKEN
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, tokenAddress, abiName: 'MintableBurnableToken' })
}

function * watchTokenChanges ({ response }) {
  yield put(actions.fetchToken(response.tokenAddress))
}

function * watchFetchCommunity ({ response }) {
  const { entities } = response
  for (const communityAddress in entities) {
    if (entities.hasOwnProperty(communityAddress)) {
      if (entities && entities[communityAddress]) {
        const { foreignTokenAddress, homeTokenAddress } = entities[communityAddress]
        const accountAddress = yield select(getAccountAddress)

        if (entities[communityAddress] && entities[communityAddress].communityURI) {
          yield put(fetchMetadata(entities[communityAddress].communityURI))
        }

        yield all([
          put(actions.fetchToken(homeTokenAddress)),
          put(actions.fetchToken(foreignTokenAddress)),
          put(actions.fetchTokenTotalSupply(homeTokenAddress, { bridgeType: 'home' })),
          put(actions.fetchTokenTotalSupply(foreignTokenAddress, { bridgeType: 'foreign' })),
          put(balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })),
          put(balanceOfToken(foreignTokenAddress, accountAddress, { bridgeType: 'foreign' }))
        ])
      }
    }
  }
}

function * addCommunityPlugin ({ communityAddress, plugin }) {
  const { data: { plugins } } = yield apiCall(addCommunityPluginApi, { communityAddress, plugin })

  yield put({
    type: ADD_COMMUNITY_PLUGIN.SUCCESS,
    communityAddress,
    response: {
      plugins
    }
  })
}

function * watchPluginsChanges () {
  const communityAddress = yield select(getCommunityAddress)
  yield put(actions.fetchCommunity(communityAddress))
}

function * transferTokenToFunder ({ tokenAddress, value }) {
  yield put(actions.transferToken(tokenAddress, funderAddress, value))

  yield put({
    type: actions.TRANSFER_TOKEN_TO_FUNDER.SUCCESS
  })
}

function * toggleJoinBonus ({ isActive }) {
  const accountAddress = yield select(getAccountAddress)
  const communityAddress = yield select(getCommunityAddress)
  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, getOptions(networkVersion))
  const action = isActive ? ADD_ENTITY : REMOVE_ENTITY
  if (isActive) {
    const adminMultiRole = combineRoles(roles.USER_ROLE, roles.ADMIN_ROLE, roles.APPROVED_ROLE)
    const method = CommunityContract.methods.addEntity(funderAddress, adminMultiRole)
    const transactionPromise = method.send({ from: accountAddress })
    yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
    yield apiCall(addCommunityPluginApi, { communityAddress, plugin: { name: 'joinBonus', isActive } })
  } else {
    const method = CommunityContract.methods.removeEntity(funderAddress)
    const transactionPromise = method.send({ from: accountAddress })
    yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
    yield apiCall(addCommunityPluginApi, { communityAddress, plugin: { name: 'joinBonus', isActive } })
  }

  yield put({
    type: TOGGLE_JOIN_BONUS.SUCCESS
  })
}

function * watchCommunities ({ response }) {
  const { result, entities } = response
  for (let account of result) {
    const entity = entities[account]
    if (entity && entity.foreignTokenAddress) {
      yield put(actions.fetchToken(entity.foreignTokenAddress))
    }

    if (entity && entity.communityURI) {
      yield put(fetchMetadata(entity.communityURI))
    }

    if (entity && entity.community) {
      yield put(actions.fetchToken(entity.community.foreignTokenAddress))
      if (entity.community && entity.community.communityURI) {
        yield put(fetchMetadata(entity.community.communityURI))
      }
    }
  }
}

export default function * tokenSaga () {
  yield all([
    tryTakeEvery(ADD_COMMUNITY_PLUGIN, addCommunityPlugin, 1),
    tryTakeEvery(actions.TRANSFER_TOKEN, transferToken, 1),
    tryTakeEvery(actions.TRANSFER_TOKEN_TO_FUNDER, transferTokenToFunder, 1),
    tryTakeEvery(actions.MINT_TOKEN, mintToken, 1),
    tryTakeEvery(actions.BURN_TOKEN, burnToken, 1),
    tryTakeEvery(actions.FETCH_TOKENS, fetchTokens, 1),
    tryTakeEvery(actions.FETCH_TOKENS_BY_OWNER, fetchTokensByOwner, 1),
    tryTakeEvery(actions.FETCH_TOKEN, fetchToken, 1),
    tryTakeEvery(actions.FETCH_COMMUNITY_DATA, fetchCommunity, 1),
    takeEvery([ADD_COMMUNITY_PLUGIN.SUCCESS, actions.TRANSFER_TOKEN_TO_FUNDER.SUCCESS, TOGGLE_JOIN_BONUS.SUCCESS], watchPluginsChanges),
    takeEvery([actions.FETCH_COMMUNITY_DATA.SUCCESS], watchFetchCommunity),
    tryTakeEvery(actions.FETCH_FUSE_TOKEN, fetchFuseToken),
    tryTakeEvery(actions.CREATE_TOKEN, createToken, 1),
    tryTakeEvery(actions.CREATE_TOKEN_WITH_METADATA, createTokenWithMetadata, 1),
    tryTakeEvery(actions.FETCH_TOKEN_PROGRESS, fetchTokenProgress, 1),
    takeEvery(DEPLOY_BRIDGE.SUCCESS, fetchTokenProgress),
    takeEvery([actions.MINT_TOKEN.SUCCESS, actions.BURN_TOKEN.SUCCESS], watchTokenChanges),
    takeEvery(actions.CREATE_TOKEN_WITH_METADATA.SUCCESS, deployChosenContracts),
    tryTakeEvery(actions.DEPLOY_EXISTING_TOKEN, deployExistingToken),
    tryTakeEvery(actions.FETCH_DEPLOY_PROGRESS, fetchDeployProgress),
    tryTakeEvery(TOGGLE_JOIN_BONUS, toggleJoinBonus, 1),
    tryTakeEvery(actions.FETCH_FEATURED_COMMUNITIES, fetchFeaturedCommunities),
    takeEvery(action => /^(FETCH_FEATURED_COMMUNITIES|FETCH_COMMUNITIES).*SUCCESS/.test(action.type), watchCommunities)
  ])
}
