import { all, put, race, call, take, takeEvery, fork, select } from 'redux-saga/effects'

import {createEntityPut} from './utils'
import * as actions from 'actions/basicToken'
import {fetchMarketMakerData} from 'sagas/marketMaker'
import {FETCH_METADATA} from 'actions/api'
import {SELECT_ACCOUNT} from 'actions/web3'
import web3, {onWeb3Ready} from 'services/web3'
import { contract } from 'osseus-wallet'
import addresses from 'constants/addresses'
import {getNetworkType, getAddresses} from 'selectors/web3'
import { delay } from 'redux-saga'
import ReactGA from 'services/ga'

const entityPut = createEntityPut('basicToken')

function * name ({tokenAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})
    const name = yield call(ColuLocalNetworkContract.methods.name().call)
    yield entityPut({type: actions.NAME.SUCCESS,
      tokenAddress,
      response: {
        name
      }})
  } catch (error) {
    yield entityPut({type: actions.NAME.FAILURE, error})
  }
}

function * symbol ({tokenAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})
    const symbol = yield call(ColuLocalNetworkContract.methods.symbol().call)
    yield entityPut({type: actions.SYMBOL.SUCCESS,
      tokenAddress,
      response: {
        symbol
      }})
  } catch (error) {
    yield entityPut({type: actions.SYMBOL.FAILURE, error})
  }
}

function * totalSupply ({tokenAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})
    const totalSupply = yield call(ColuLocalNetworkContract.methods.totalSupply().call)
    yield entityPut({type: actions.TOTAL_SUPPLY.SUCCESS,
      tokenAddress,
      response: {
        totalSupply
      }})
  } catch (error) {
    yield entityPut({type: actions.TOTAL_SUPPLY.FAILURE, error})
  }
}

function * tokenURI ({tokenAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: tokenAddress})
    const tokenURI = yield call(ColuLocalNetworkContract.methods.tokenURI().call)
    yield entityPut({type: actions.TOKEN_URI.SUCCESS,
      tokenAddress,
      response: {
        tokenURI
      }})
  } catch (error) {
    yield entityPut({type: actions.TOKEN_URI.FAILURE, error})
  }
}

function * setTokenURI ({tokenAddress, tokenURI}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: tokenAddress})
    yield ColuLocalNetworkContract.methods.setTokenURI(tokenURI).send({
      from: web3.eth.defaultAccount
    })
    yield entityPut({type: actions.SET_TOKEN_URI.SUCCESS,
      tokenAddress,
      response: {
        tokenURI
      }})
  } catch (error) {
    yield entityPut({type: actions.SET_TOKEN_URI.FAILURE, error})
  }
}

function * owner ({tokenAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: tokenAddress})
    const owner = yield call(ColuLocalNetworkContract.methods.owner().call)
    yield entityPut({type: actions.OWNER.SUCCESS,
      tokenAddress,
      response: {
        owner
      }})
  } catch (error) {
    yield entityPut({type: actions.OWNER.FAILURE, error})
  }
}

function * balanceOf ({tokenAddress, accountAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})
    const balanceOf = yield call(ColuLocalNetworkContract.methods.balanceOf(accountAddress).call)

    yield entityPut({type: actions.BALANCE_OF.SUCCESS,
      tokenAddress,
      accountAddress,
      response: {
        balanceOf
      }})
  } catch (error) {
    yield entityPut({type: actions.BALANCE_OF.FAILURE, error})
  }
}

function * transfer ({tokenAddress, to, value}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})
    const receipt = yield ColuLocalNetworkContract.methods.transfer(to, value).send({
      from: web3.eth.defaultAccount
    })
    yield entityPut({type: actions.BALANCE_OF.REQUEST, accountAddress: receipt.from, tokenAddress})
    yield entityPut({type: actions.TRANSFER.SUCCESS, receipt})
  } catch (error) {
    yield entityPut({type: actions.TRANSFER.FAILURE, error})
  }
}

function * approve ({tokenAddress, spender, value}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})
    const receipt = yield ColuLocalNetworkContract.methods.approve(spender, value).send({
      from: web3.eth.defaultAccount
    })
    yield entityPut({type: actions.APPROVE.REQUEST, address: receipt.from})
  } catch (error) {
    yield entityPut({type: actions.APPROVE.FAILURE, error})
  }
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
    yield onWeb3Ready

    if (web3.eth.defaultAccount) {
      yield put({
        type: actions.BALANCE_OF.REQUEST,
        tokenAddress,
        accountAddress: web3.eth.defaultAccount
      })
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
  try {
    const tokenResponse = yield call(fetchCommunityToken, {tokenAddress})
    yield call(fetchMarketMakerData, {tokenAddress, mmAddress: tokenResponse.mmAddress})
    yield entityPut({type: actions.FETCH_COMMUNITY.SUCCESS, tokenAddress})
  } catch (error) {
    console.error(error)
    yield entityPut({type: actions.FETCH_COMMUNITY.FAILURE, tokenAddress, error})
  }
}

function * fetchCommunityContract ({tokenAddress}) {
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
    yield onWeb3Ready

    if (web3.eth.defaultAccount) {
      yield put({
        type: actions.BALANCE_OF.REQUEST,
        tokenAddress,
        accountAddress: web3.eth.defaultAccount
      })
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

    yield fetchMarketMakerData({tokenAddress, mmAddress: response.mmAddress})

    yield entityPut({type: actions.FETCH_COMMUNITY_CONTRACT.SUCCESS,
      tokenAddress,
      response
    })
  } catch (error) {
    console.error(error)
    yield entityPut({type: actions.FETCH_COMMUNITY_CONTRACT.FAILURE, tokenAddress, error})
  }
}

function * fetchClnContract ({tokenAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: tokenAddress})

    const calls = {
      name: call(ColuLocalNetworkContract.methods.name().call),
      symbol: call(ColuLocalNetworkContract.methods.symbol().call),
      totalSupply: call(ColuLocalNetworkContract.methods.totalSupply().call),
      owner: call(ColuLocalNetworkContract.methods.owner().call)
    }

    // wait untill web3 is ready
    yield onWeb3Ready

    if (web3.eth.defaultAccount) {
      calls.balanceOf = call(ColuLocalNetworkContract.methods.balanceOf(web3.eth.defaultAccount).call)
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
  } catch (error) {
    console.error(error)
    yield entityPut({type: actions.FETCH_CLN_CONTRACT.FAILURE, tokenAddress, error})
  }
}

function * selectAccount ({response}) {
  const addresses = yield select(getAddresses)
  if (addresses) {
    const tokenAddress = addresses.ColuLocalNetwork
    yield entityPut({type: actions.BALANCE_OF.REQUEST, tokenAddress, accountAddress: response.accountAddress})
  }
}

export default function * rootSaga () {
  yield all([
    takeEvery(actions.NAME.REQUEST, name),
    takeEvery(actions.SYMBOL.REQUEST, symbol),
    takeEvery(actions.TOTAL_SUPPLY.REQUEST, totalSupply),
    takeEvery(actions.TOKEN_URI.REQUEST, tokenURI),
    takeEvery(actions.SET_TOKEN_URI.REQUEST, setTokenURI),
    takeEvery(actions.OWNER.REQUEST, owner),
    takeEvery(actions.BALANCE_OF.REQUEST, balanceOf),
    takeEvery(actions.TRANSFER.REQUEST, transfer),
    takeEvery(actions.APPROVE.REQUEST, approve),
    takeEvery(actions.FETCH_COMMUNITY_CONTRACT.REQUEST, fetchCommunityContract),
    takeEvery(actions.FETCH_CLN_CONTRACT.REQUEST, fetchClnContract),
    takeEvery(actions.FETCH_COMMUNITY.REQUEST, fetchCommunity),
    takeEvery(SELECT_ACCOUNT, selectAccount)
  ])
}
