import { all, put, race, call, take, select, fork } from 'redux-saga/effects'

import {createEntityPut, tryTakeEvery} from './utils'
import * as actions from 'actions/communities'
import {fetchMarketMakerData} from 'sagas/marketMaker'
import {fetchMetadata, FETCH_METADATA} from 'actions/metadata'
import {createMetadata} from 'sagas/metadata'
import {subscribeToChange} from 'actions/subscriptions'
import {createCurrency} from 'actions/issuance'

import { contract } from 'osseus-wallet'
import {getAddresses} from 'selectors/network'
import { delay } from 'redux-saga'

const entityPut = createEntityPut(actions.entityName)

function * initializeCommunity ({tokenAddress}) {
  const tokenResponse = yield call(fetchCommunity, {tokenAddress})
  yield put(subscribeToChange(tokenResponse.address, tokenResponse.mmAddress))
  yield entityPut({type: actions.INITIALIZE_COMMUNITY.SUCCESS, tokenAddress})
}

function * fetchCommunity ({tokenAddress}) {
  const tokenResponse = yield call(fetchCommunityToken, {tokenAddress})
  yield fork(fetchMarketMakerData, {tokenAddress, mmAddress: tokenResponse.mmAddress})
  yield entityPut({type: actions.FETCH_COMMUNITY.SUCCESS, tokenAddress})
  return tokenResponse
}

function * fetchCommunityToken ({tokenAddress}) {
  try {
    const addresses = yield select(getAddresses)
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: tokenAddress})
    const CurrencyFactoryContract = contract.getContract({abiName: 'CurrencyFactory',
      address: addresses.CurrencyFactory
    })

    const calls = {
      name: call(ColuLocalNetworkContract.methods.name().call),
      symbol: call(ColuLocalNetworkContract.methods.symbol().call),
      totalSupply: call(ColuLocalNetworkContract.methods.totalSupply().call),
      owner: call(ColuLocalNetworkContract.methods.owner().call),
      tokenURI: call(ColuLocalNetworkContract.methods.tokenURI().call),
      mmAddress: call(CurrencyFactoryContract.methods.getMarketMakerAddressFromToken(tokenAddress).call)
    }

    const response = yield all(calls)
    response.isLocalCurrency = true
    response.address = tokenAddress
    response.path = '/view/community/' + response.name.toLowerCase().replace(/ /g, '')

    if (response.tokenURI) {
      const [protocol, hash] = response.tokenURI.split('://')
      yield put(fetchMetadata(protocol, hash, tokenAddress))

      // wait untill timeout for the metadata to finish.
      // It's only needed for more smooth rendering of communities
      yield race({
        metadata: take(action =>
          action.type === FETCH_METADATA.SUCCESS && action.tokenAddress === tokenAddress),
        timeout: call(delay, CONFIG.api.timeout)
      })
    }

    yield entityPut({type: actions.FETCH_COMMUNITY_TOKEN.SUCCESS,
      tokenAddress,
      response
    })

    return response
  } catch (error) {
    console.error(error)
    yield entityPut({type: actions.FETCH_COMMUNITY_TOKEN.FAILURE, tokenAddress, error})
  }
}

function * fetchClnContract ({tokenAddress}) {
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})

  const calls = {
    name: call(ColuLocalNetworkContract.methods.name().call),
    symbol: call(ColuLocalNetworkContract.methods.symbol().call),
    totalSupply: call(ColuLocalNetworkContract.methods.totalSupply().call),
    owner: call(ColuLocalNetworkContract.methods.owner().call)
  }

  const response = yield all(calls)
  response.isLocalCurrency = false
  response.address = tokenAddress

  yield entityPut({type: actions.FETCH_CLN_CONTRACT.SUCCESS,
    tokenAddress,
    response
  })
}

function * issueCommunity ({communityMetadata, currencyData}) {
  const {hash, protocol} = yield call(createMetadata, {metadata: communityMetadata})
  const tokenURI = `${protocol}://${hash}`
  yield put(createCurrency({...currencyData, tokenURI}))
}

export default function * communitiesSaga () {
  yield all([
    tryTakeEvery(actions.FETCH_CLN_CONTRACT, fetchClnContract),
    tryTakeEvery(actions.FETCH_COMMUNITY, fetchCommunity),
    tryTakeEvery(actions.INITIALIZE_COMMUNITY, initializeCommunity),
    tryTakeEvery(actions.ISSUE_COMMUNITY, issueCommunity, 1)
  ])
}
