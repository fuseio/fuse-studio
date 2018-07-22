import { all, put, race, call, take, takeEvery, select } from 'redux-saga/effects'

import {createEntityPut, tryTakeEvery} from './utils'
import * as actions from 'actions/basicToken'
import {fetchMarketMakerData} from 'sagas/marketMaker'
import {FETCH_METADATA} from 'actions/api'
import {CHECK_ACCOUNT_CHANGED} from 'actions/web3'
import web3 from 'services/web3'
import { contract } from 'osseus-wallet'
import addresses from 'constants/addresses'
import {getNetworkType, getAddresses, getCommunityAddresses} from 'selectors/web3'
import { delay } from 'redux-saga'
import ReactGA from 'services/ga'

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
    from: web3.eth.defaultAccount
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

function * balanceOf ({tokenAddress, accountAddress, blockNumber}) {
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})
  const balanceOf = yield call(ColuLocalNetworkContract.methods.balanceOf(accountAddress).call, null, blockNumber)

  yield put({type: actions.BALANCE_OF.SUCCESS,
    tokenAddress,
    accountAddress,
    response: {
      balanceOf
    }})
}

function * transfer ({tokenAddress, to, value}) {
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})
  const receipt = yield ColuLocalNetworkContract.methods.transfer(to, value).send({
    from: web3.eth.defaultAccount
  })
  yield entityPut({type: actions.BALANCE_OF.REQUEST, accountAddress: receipt.from, tokenAddress})
  yield entityPut({type: actions.TRANSFER.SUCCESS, receipt})
}

function * approve ({tokenAddress, spender, value}) {
  const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})
  const receipt = yield ColuLocalNetworkContract.methods.approve(spender, value).send({
    from: web3.eth.defaultAccount
  })

  yield entityPut({type: actions.APPROVE.REQUEST, address: receipt.from})
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

    // wait untill web3 is ready
    // yield onWeb3Ready

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
  yield call(fetchMarketMakerData, {tokenAddress, mmAddress: tokenResponse.mmAddress})
  yield entityPut({type: actions.FETCH_COMMUNITY.SUCCESS, tokenAddress})
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
  ReactGA.event({
    category: 'Metamask',
    action: 'CLN balance',
    label: response.balanceOf > 0 ? 'Yes' : 'No'
  })

  yield entityPut({type: actions.FETCH_CLN_CONTRACT.SUCCESS,
    tokenAddress,
    response
  })
}

function * updateBalances ({accountAddress}) {
  const addresses = yield select(getAddresses)
  const communityAddresses = yield select(getCommunityAddresses)
  if (addresses) {
    yield put({type: actions.BALANCE_OF.REQUEST, tokenAddress: addresses.ColuLocalNetwork, accountAddress})
    for (let communityAddress of communityAddresses) {
      yield put({type: actions.BALANCE_OF.REQUEST, tokenAddress: communityAddress, accountAddress})
    }
  }
}

export function * watchAccountChanged ({response}) {
  yield put({
    type: actions.UPDATE_BALANCES.REQUEST,
    accountAddress: response.accountAddress
  })
}

export default function * rootSaga () {
  yield all([
    tryTakeEvery(actions.NAME, name),
    tryTakeEvery(actions.SYMBOL, symbol),
    tryTakeEvery(actions.TOTAL_SUPPLY, totalSupply),
    tryTakeEvery(actions.TOKEN_URI, tokenURI),
    tryTakeEvery(actions.SET_TOKEN_URI, setTokenURI),
    tryTakeEvery(actions.OWNER, owner),
    tryTakeEvery(actions.BALANCE_OF, balanceOf),
    tryTakeEvery(actions.TRANSFER, transfer),
    tryTakeEvery(actions.APPROVE, approve),
    tryTakeEvery(actions.FETCH_CLN_CONTRACT, fetchClnContract),
    tryTakeEvery(actions.FETCH_COMMUNITY, fetchCommunity),
    tryTakeEvery(actions.UPDATE_BALANCES, updateBalances),
    takeEvery(CHECK_ACCOUNT_CHANGED.SUCCESS, watchAccountChanged)
  ])
}
