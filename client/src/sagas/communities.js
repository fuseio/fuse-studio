import { all, put, race, call, take, select, fork } from 'redux-saga/effects'

import {createEntityPut, tryTakeEvery} from './utils'
import * as actions from 'actions/communities'
import {addCommunity} from 'services/api'
import {fetchMarketMakerData} from 'sagas/marketMaker'
import {fetchMetadata, FETCH_METADATA} from 'actions/metadata'
import {createMetadata} from 'sagas/metadata'
import {subscribeToChange} from 'actions/subscriptions'
import {createCurrency} from 'sagas/issuance'
import {fetchTokenQuote} from 'actions/fiat'
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
      symbol: call(ColuLocalNetworkContract.methods.symbol().call),
      tokenURI: call(ColuLocalNetworkContract.methods.tokenURI().call),
      currencyMap: call(CurrencyFactoryContract.methods.currencyMap(tokenAddress).call)
    }

    const response = yield all(calls)

    const {name, totalSupply, owner, mmAddress} = response.currencyMap

    const community = {
      symbol: response.symbol,
      tokenURI: response.tokenURI,
      totalSupply,
      name,
      mmAddress,
      owner,
      isLocalCurrency: true,
      path: '/view/community/' + name.toLowerCase().replace(/ /g, '')
    }

    if (community.tokenURI) {
      const [protocol, hash] = community.tokenURI.split('://')
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
      response: community
    })

    return community
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

  yield put(fetchTokenQuote(response.symbol, 'USD'))

  yield entityPut({type: actions.FETCH_CLN_CONTRACT.SUCCESS,
    tokenAddress,
    response
  })
}

function * issueCommunity ({communityMetadata, currencyData}) {
  const {hash, protocol} = yield call(createMetadata, {metadata: communityMetadata})
  const tokenURI = `${protocol}://${hash}`
  const receipt = yield call(createCurrency, {...currencyData, tokenURI})

  yield addCommunity({
    receipt
  })

  const tokenAddress = receipt.events.TokenCreated.returnValues.token

  yield entityPut({
    type: actions.ISSUE_COMMUNITY.SUCCESS,
    tokenAddress
  })
}

export default function * communitiesSaga () {
  yield all([
    tryTakeEvery(actions.FETCH_CLN_CONTRACT, fetchClnContract),
    tryTakeEvery(actions.FETCH_COMMUNITY, fetchCommunity),
    tryTakeEvery(actions.INITIALIZE_COMMUNITY, initializeCommunity),
    tryTakeEvery(actions.ISSUE_COMMUNITY, issueCommunity, 1)
  ])
}
