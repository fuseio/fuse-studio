import { all, put, race, call, take, select, fork } from 'redux-saga/effects'

import {createEntityPut, tryTakeEvery} from './utils'
import * as actions from 'actions/basicToken'
import {fetchMarketMakerData} from 'sagas/marketMaker'
import {FETCH_METADATA} from 'actions/api'
import {subscribeToChange} from 'actions/subscriptions'

import network from 'services/web3'
import { contract } from 'osseus-wallet'
import addresses from 'constants/addresses'
import {getNetworkType} from 'selectors/network'
import { delay } from 'redux-saga'

const entityPut = createEntityPut('basicToken')

function * name ({tokenAddress}) {
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})
  const name = yield call(ColuLocalNetworkContract.methods.name().call)

  yield entityPut({type: actions.NAME.SUCCESS,
    tokenAddress,
    response: {
      name
    }})
}

function * symbol ({tokenAddress}) {
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})
  const symbol = yield call(ColuLocalNetworkContract.methods.symbol().call)

  yield entityPut({type: actions.SYMBOL.SUCCESS,
    tokenAddress,
    response: {
      symbol
    }})
}

function * totalSupply ({tokenAddress}) {
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})
  const totalSupply = yield call(ColuLocalNetworkContract.methods.totalSupply().call)

  yield entityPut({type: actions.TOTAL_SUPPLY.SUCCESS,
    tokenAddress,
    response: {
      totalSupply
    }})
}

function * tokenURI ({tokenAddress}) {
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: tokenAddress})
  const tokenURI = yield call(ColuLocalNetworkContract.methods.tokenURI().call)

  yield entityPut({type: actions.TOKEN_URI.SUCCESS,
    tokenAddress,
    response: {
      tokenURI
    }}
  )
}

function * setTokenURI ({tokenAddress, tokenURI}) {
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: tokenAddress})
  yield ColuLocalNetworkContract.methods.setTokenURI(tokenURI).send({
    from: network.eth.defaultAccount
  })

  yield entityPut({type: actions.SET_TOKEN_URI.SUCCESS,
    tokenAddress,
    response: {
      tokenURI
    }})
}

function * owner ({tokenAddress}) {
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: tokenAddress})
  const owner = yield call(ColuLocalNetworkContract.methods.owner().call)

  yield entityPut({type: actions.OWNER.SUCCESS,
    tokenAddress,
    response: {
      owner
    }})
}

function * fetchCommunityToken ({tokenAddress}) {
  try {
    const networkType = yield select(getNetworkType)
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: tokenAddress})
    const CurrencyFactoryContract = contract.getContract({abiName: 'CurrencyFactory',
      address: addresses[networkType].CurrencyFactory
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
      yield put({
        type: FETCH_METADATA.REQUEST,
        protocol,
        hash,
        tokenAddress
      })

      // wait until timeout to receive the metadata
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

function * fetchCommunity ({tokenAddress}) {
  const tokenResponse = yield call(fetchCommunityToken, {tokenAddress})
  yield fork(fetchMarketMakerData, {tokenAddress, mmAddress: tokenResponse.mmAddress})
  yield entityPut({type: actions.FETCH_COMMUNITY.SUCCESS, tokenAddress})
  return tokenResponse
}

function * initializeCommunity ({tokenAddress}) {
  const tokenResponse = yield call(fetchCommunity, {tokenAddress})
  yield put(subscribeToChange(tokenResponse.address, tokenResponse.mmAddress))
  yield entityPut({type: actions.INITIALIZE_COMMUNITY.SUCCESS, tokenAddress})
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

export default function * basicTokenSaga () {
  yield all([
    tryTakeEvery(actions.NAME, name),
    tryTakeEvery(actions.SYMBOL, symbol),
    tryTakeEvery(actions.TOTAL_SUPPLY, totalSupply),
    tryTakeEvery(actions.TOKEN_URI, tokenURI),
    tryTakeEvery(actions.SET_TOKEN_URI, setTokenURI),
    tryTakeEvery(actions.OWNER, owner),
    tryTakeEvery(actions.FETCH_CLN_CONTRACT, fetchClnContract),
    tryTakeEvery(actions.FETCH_COMMUNITY, fetchCommunity),
    tryTakeEvery(actions.INITIALIZE_COMMUNITY, initializeCommunity)
  ])
}
