import { all, call, put, select, takeEvery } from 'redux-saga/effects'
import BasicToken from '@fuse/token-factory-contracts/abi/BasicToken'
import { getAddress } from 'selectors/network'
import * as actions from 'actions/token'
import { fetchHomeTokenAddress, toggleMultiBridge } from 'actions/bridge'
import { balanceOfToken } from 'actions/accounts'
import { fetchMetadata } from 'actions/metadata'
import { ADD_COMMUNITY_PLUGIN, SET_BONUS, SET_WALLET_BANNER_LINK, UPDATE_COMMUNITY_METADATA, SET_SECONDARY_TOKEN } from 'actions/community'
import { createMetadata } from 'sagas/metadata'
import { getAccountAddress } from 'selectors/accounts'
import * as api from 'services/api/token'
import { transactionSucceeded } from 'actions/transactions'
import { apiCall, createEntityPut, tryTakeEvery, createEntitiesFetch } from './utils'
import { transactionFlow } from './transaction'
import MintableBurnableTokenAbi from 'constants/abi/MintableBurnableToken'
import { getWeb3 } from 'sagas/network'
import { fetchFeaturedCommunityEntitiesCount } from 'sagas/communityEntities'
import {
  fetchCommunity as fetchCommunityApi,
  updateCommunityMetadata as updateCommunityMetadataApi,
  addCommunityPlugin as addCommunityPluginApi,
  setSecondaryToken as setSecondaryTokenApi
} from 'services/api/community'
import {
  createMetadata as createMetadataApi
} from 'services/api/metadata'
import { imageUpload } from 'services/api/images'
import { getCommunityAddress } from 'selectors/entities'
import get from 'lodash/get'
import TokenFactoryABI from '@fuse/token-factory-contracts/abi/TokenFactoryWithEvents'
import { getOptions, getNetworkVersion } from 'utils/network'
import FuseTokenABI from 'constants/abi/FuseToken'
const { addresses: { fuse: { funder: funderAddress } } } = CONFIG.web3

const entityPut = createEntityPut(actions.entityName)

const fetchTokens = createEntitiesFetch(actions.FETCH_TOKENS, api.fetchTokens)
const fetchToken = createEntitiesFetch(actions.FETCH_TOKEN, api.fetchToken)
const fetchTokensByOwner = createEntitiesFetch(actions.FETCH_TOKENS_BY_OWNER, api.fetchTokensByOwner)
const fetchFeaturedCommunities = createEntitiesFetch(actions.FETCH_FEATURED_COMMUNITIES, api.fetchFeaturedCommunities)

function * fetchTokenFromCurrentNetwork ({ tokenAddress }) {
  const web3 = yield getWeb3()
  const FuseTokenContract = new web3.eth.Contract(FuseTokenABI, tokenAddress)
  const calls = {
    name: call(FuseTokenContract.methods.name().call),
    symbol: call(FuseTokenContract.methods.symbol().call),
    totalSupply: call(FuseTokenContract.methods.totalSupply().call)
  }
  const response = yield all(calls)

  yield entityPut({
    type: actions.FETCH_TOKEN_FROM_ETHEREUM.SUCCESS,
    address: tokenAddress,
    response: {
      ...response,
      address: tokenAddress
    }
  })
}

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

  yield entityPut({
    type: actions.FETCH_FUSE_TOKEN.SUCCESS,
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
  const response = yield call(createMetadata, { metadata })
  const uri = response.uri || `ipfs://${response.hash}`
  const newSteps = { ...steps, community: { ...steps.community, args: { ...steps.community.args, communityURI: uri } } }
  const receipt = yield call(createToken, { ...tokenData, tokenURI: uri, tokenType })
  yield put(transactionSucceeded(actions.CREATE_TOKEN_WITH_METADATA, receipt, { steps: newSteps }))
}

function * deployChosenContracts ({ response: { steps, receipt } }) {
  const homeTokenAddress = receipt.events.TokenCreated.returnValues.token
  const { data: { _id: id } } = yield apiCall(api.deployChosenContracts, { steps: { ...steps, community: { args: { ...steps.community.args, homeTokenAddress } } } })

  yield put({
    type: actions.DEPLOY_TOKEN.SUCCESS,
    response: {
      id
    }
  })
}

function * deployExistingToken ({ steps, metadata }) {
  yield put({
    type: actions.DEPLOY_TOKEN.REQUEST
  })
  const response = yield call(createMetadata, { metadata })
  const communityURI = response.uri || `ipfs://${response.hash}`
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

function * addMinter ({ tokenAddress, minterAddress }) {
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const contract = new web3.eth.Contract(MintableBurnableTokenAbi, tokenAddress, getOptions(networkVersion))

  const transactionPromise = contract.methods.addMinter(minterAddress).send({
    from: accountAddress
  })

  const action = actions.ADD_MINTER
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, tokenAddress, abiName: 'MintableBurnableToken' })
}

function * watchTokenChanges ({ response }) {
  yield put(actions.fetchToken(response.tokenAddress))
}

function * fetchCommunity ({ type, ...params }) {
  const accountAddress = yield select(getAccountAddress)
  const fetcher = yield createEntitiesFetch(actions.FETCH_COMMUNITY_DATA, fetchCommunityApi)
  const response = yield fetcher({ ...params })
  const { options, _id } = response
  if (_id) {
    const foreignTokenAddress = get(response, 'foreignTokenAddress')
    const homeTokenAddress = get(response, 'homeTokenAddress')
    const communityURI = get(response, 'communityURI')
    const communityAddress = get(response, 'communityAddress')
    const isMultiBridge = get(response, 'isMultiBridge')
    const calls = [
      put(toggleMultiBridge(isMultiBridge))
    ]
    if (foreignTokenAddress) {
      calls.push(
        put(fetchHomeTokenAddress(communityAddress, foreignTokenAddress, options)),
        put(actions.fetchToken(foreignTokenAddress, options)),
        put(actions.fetchTokenTotalSupply(foreignTokenAddress, { ...options, bridgeType: 'foreign' })),
        put(balanceOfToken(foreignTokenAddress, accountAddress, options))
      )
    }

    if (homeTokenAddress) {
      calls.push(
        put(actions.fetchToken(homeTokenAddress, options)),
        put(actions.fetchTokenTotalSupply(homeTokenAddress, { bridgeType: 'home' })),
        put(balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' }))
      )
    }
    if (communityURI) {
      calls.push(
        put(fetchMetadata(communityURI))
      )
    }
    yield all(calls)
  }
}

function * addCommunityPlugin ({ communityAddress, plugin }) {
  const { data: community } = yield apiCall(addCommunityPluginApi, { communityAddress, plugin })
  yield put({
    type: ADD_COMMUNITY_PLUGIN.SUCCESS,
    communityAddress,
    entity: 'communities',
    response: community
  })
}

function * updateCommunityMetadata ({ communityAddress, fields: { metadata, ...rest } }) {
  const { communityURI } = yield select(state => state.entities.communities[communityAddress])
  const currentMetadata = yield select(state => state.entities.metadata[communityURI])
  let isMetadataUpdated = false
  if (get(metadata, 'image')) {
    const { hash, uri } = yield apiCall(imageUpload, { image: get(metadata, 'image') })
    currentMetadata.imageUri = uri
    currentMetadata.image = hash
    isMetadataUpdated = true
  }

  if (get(metadata, 'coverPhoto')) {
    const { hash, uri } = yield apiCall(imageUpload, { image: get(metadata, 'coverPhoto') })
    currentMetadata.coverPhotoUri = uri
    currentMetadata.coverPhoto = hash
    isMetadataUpdated = true
  }
  let newCommunityURI
  if (isMetadataUpdated) {
    const { hash, uri } = yield apiCall(createMetadataApi, { metadata: currentMetadata })
    newCommunityURI = uri || `ipfs://${hash}`
  }
  const { data: community } = yield apiCall(updateCommunityMetadataApi, { communityAddress, communityURI: newCommunityURI, ...rest })

  yield put(fetchMetadata(newCommunityURI))
  yield put({
    type: UPDATE_COMMUNITY_METADATA.SUCCESS,
    communityAddress,
    entity: 'communities',
    response: community
  })
}

function * setSecondaryToken ({ communityAddress, secondaryTokenAddress }) {
  const { data: community } = yield apiCall(setSecondaryTokenApi, { communityAddress, secondaryTokenAddress, networkType: 'fuse', tokenType: 'basic' })
  yield put({
    type: SET_SECONDARY_TOKEN.SUCCESS,
    communityAddress,
    entity: 'communities',
    response: community
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

function * setBonus ({ amount, isActive, bonusType }) {
  const communityAddress = yield select(getCommunityAddress)

  const infoFieldsMapping = {
    inviteBonus: 'inviteInfo',
    backupBonus: 'backupInfo',
    joinBonus: 'joinInfo'
  }

  const infoField = infoFieldsMapping[bonusType]

  yield call(addCommunityPlugin, { communityAddress, plugin: { name: bonusType, isActive, [infoField]: { amount: amount && amount.toString() } } })

  yield put({
    type: SET_BONUS.SUCCESS
  })
}

export function * setWalletBannerLink ({ link, walletBanner }) {
  const plugin = { name: 'walletBanner', link, isActive: true }
  if (walletBanner && walletBanner.blob) {
    const { hash } = yield apiCall(imageUpload, { image: walletBanner.blob })
    plugin.walletBannerHash = hash
  }
  const communityAddress = yield select(getCommunityAddress)
  yield call(addCommunityPlugin, { communityAddress, plugin })

  yield put({
    type: SET_WALLET_BANNER_LINK.SUCCESS
  })
}

function * watchCommunities ({ response }) {
  const { result, entities } = response
  const firstPage = result.slice(0, 10)
  for (const account of firstPage) {
    const entity = entities[account]
    if (entity && entity.foreignTokenAddress) {
      yield put(actions.fetchToken(entity.foreignTokenAddress, entity.originNetwork && { networkType: entity.originNetwork }))
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

function * watchFeaturedCommunities ({ response }) {
  const { result, entities } = response
  for (const account of result) {
    const { communityAddress, foreignTokenAddress, originNetwork, communityURI } = entities[account]
    yield call(fetchFeaturedCommunityEntitiesCount, { communityAddress })
    if (foreignTokenAddress) {
      yield put(actions.fetchToken(foreignTokenAddress, originNetwork && { networkType: originNetwork }))
    }

    if (communityURI) {
      yield put(fetchMetadata(communityURI))
    }
  }
}

export default function * tokenSaga () {
  yield all([
    tryTakeEvery(ADD_COMMUNITY_PLUGIN, addCommunityPlugin, 1),
    tryTakeEvery(UPDATE_COMMUNITY_METADATA, updateCommunityMetadata, 1),
    tryTakeEvery(SET_WALLET_BANNER_LINK, setWalletBannerLink, 1),
    tryTakeEvery(actions.TRANSFER_TOKEN, transferToken, 1),
    tryTakeEvery(actions.TRANSFER_TOKEN_TO_FUNDER, transferTokenToFunder, 1),
    tryTakeEvery(actions.MINT_TOKEN, mintToken, 1),
    tryTakeEvery(actions.BURN_TOKEN, burnToken, 1),
    tryTakeEvery(actions.ADD_MINTER, addMinter, 1),
    tryTakeEvery(actions.FETCH_TOKENS, fetchTokens, 1),
    tryTakeEvery(actions.FETCH_TOKENS_BY_OWNER, fetchTokensByOwner, 1),
    tryTakeEvery(actions.FETCH_TOKEN, fetchToken, 1),
    tryTakeEvery(actions.FETCH_TOKEN_FROM_ETHEREUM, fetchTokenFromCurrentNetwork, 1),
    tryTakeEvery(actions.FETCH_COMMUNITY_DATA, fetchCommunity, 1),
    takeEvery([actions.TRANSFER_TOKEN_TO_FUNDER.SUCCESS], watchPluginsChanges),
    tryTakeEvery(actions.FETCH_FUSE_TOKEN, fetchFuseToken),
    tryTakeEvery(actions.CREATE_TOKEN, createToken, 1),
    tryTakeEvery(actions.CREATE_TOKEN_WITH_METADATA, createTokenWithMetadata, 0),
    tryTakeEvery(actions.FETCH_TOKEN_PROGRESS, fetchTokenProgress, 1),
    takeEvery([actions.MINT_TOKEN.SUCCESS, actions.BURN_TOKEN.SUCCESS], watchTokenChanges),
    takeEvery(actions.CREATE_TOKEN_WITH_METADATA.SUCCESS, deployChosenContracts),
    tryTakeEvery(actions.DEPLOY_EXISTING_TOKEN, deployExistingToken, 0),
    tryTakeEvery(actions.FETCH_DEPLOY_PROGRESS, fetchDeployProgress),
    tryTakeEvery(SET_BONUS, setBonus, 1),
    tryTakeEvery(SET_SECONDARY_TOKEN, setSecondaryToken, 1),
    tryTakeEvery(actions.FETCH_FEATURED_COMMUNITIES, fetchFeaturedCommunities),
    takeEvery(action => /^(FETCH_COMMUNITIES).*SUCCESS/.test(action.type), watchCommunities),
    takeEvery(action => /^(FETCH_FEATURED_COMMUNITIES).*SUCCESS/.test(action.type), watchFeaturedCommunities)
  ])
}
