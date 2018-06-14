import { all, put, race, call, take, takeEvery, fork, select } from 'redux-saga/effects'

import {createEntityPut} from './utils'
import * as actions from 'actions/basicToken'
import * as marketMakerActions from 'actions/marketMaker'
import {FETCH_METADATA} from 'actions/api'
import {SELECT_ACCOUNT} from 'actions/web3'
import web3, {onWeb3Ready} from 'services/web3'
import { contract } from 'osseus-wallet'
import addresses from 'constants/addresses'
import {getNetworkType, getAddresses} from 'selectors/web3'
import { delay } from 'redux-saga'
import ReactGA from 'services/ga'

const entityPut = createEntityPut('basicToken')

export function * name ({contractAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})
    const name = yield call(ColuLocalNetworkContract.methods.name().call)
    yield entityPut({type: actions.NAME.SUCCESS,
      contractAddress,
      response: {
        name
      }})
  } catch (error) {
    yield entityPut({type: actions.NAME.FAILURE, error})
  }
}

export function * symbol ({contractAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})
    const symbol = yield call(ColuLocalNetworkContract.methods.symbol().call)
    yield entityPut({type: actions.SYMBOL.SUCCESS,
      contractAddress,
      response: {
        symbol
      }})
  } catch (error) {
    yield entityPut({type: actions.SYMBOL.FAILURE, error})
  }
}

export function * totalSupply ({contractAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})
    const totalSupply = yield call(ColuLocalNetworkContract.methods.totalSupply().call)
    yield entityPut({type: actions.TOTAL_SUPPLY.SUCCESS,
      contractAddress,
      response: {
        totalSupply
      }})
  } catch (error) {
    yield entityPut({type: actions.TOTAL_SUPPLY.FAILURE, error})
  }
}

export function * tokenURI ({contractAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: contractAddress})
    const tokenURI = yield call(ColuLocalNetworkContract.methods.tokenURI().call)
    yield entityPut({type: actions.TOKEN_URI.SUCCESS,
      contractAddress,
      response: {
        tokenURI
      }})
  } catch (error) {
    yield entityPut({type: actions.TOKEN_URI.FAILURE, error})
  }
}

export function * setTokenURI ({contractAddress, tokenURI}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: contractAddress})
    yield ColuLocalNetworkContract.methods.setTokenURI(tokenURI).send({
      from: web3.eth.defaultAccount
    })
    yield entityPut({type: actions.SET_TOKEN_URI.SUCCESS,
      contractAddress,
      response: {
        tokenURI
      }})
  } catch (error) {
    yield entityPut({type: actions.SET_TOKEN_URI.FAILURE, error})
  }
}

export function * owner ({contractAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: contractAddress})
    const owner = yield call(ColuLocalNetworkContract.methods.owner().call)
    yield entityPut({type: actions.OWNER.SUCCESS,
      contractAddress,
      response: {
        owner
      }})
  } catch (error) {
    yield entityPut({type: actions.OWNER.FAILURE, error})
  }
}

export function * balanceOf ({contractAddress, address}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})
    const balanceOf = yield call(ColuLocalNetworkContract.methods.balanceOf(address).call)
    yield entityPut({type: actions.BALANCE_OF.SUCCESS,
      contractAddress,
      response: {
        balanceOf
      }})
  } catch (error) {
    yield entityPut({type: actions.BALANCE_OF.FAILURE, error})
  }
}

export function * transfer ({contractAddress, to, value}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})
    const receipt = yield ColuLocalNetworkContract.methods.transfer(to, value).send({
      from: web3.eth.defaultAccount
    })
    yield entityPut({type: actions.BALANCE_OF.REQUEST, address: receipt.from})
    yield entityPut({type: actions.TRANSFER.SUCCESS, receipt})
  } catch (error) {
    yield entityPut({type: actions.TRANSFER.FAILURE, error})
  }
}

export function * approve ({contractAddress, spender, value}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})
    const receipt = yield ColuLocalNetworkContract.methods.approve(spender, value).send({
      from: web3.eth.defaultAccount
    })
    yield entityPut({type: actions.APPROVE.REQUEST, address: receipt.from})
  } catch (error) {
    yield entityPut({type: actions.APPROVE.FAILURE, error})
  }
}

export function * fetchCommunityContract ({contractAddress}) {
  try {
    const networkType = yield select(getNetworkType)
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: contractAddress})
    const CurrencyFactoryContract = contract.getContract({abiName: 'CurrencyFactory',
      address: addresses[networkType].CurrencyFactory
    })

    const calls = {
      name: call(ColuLocalNetworkContract.methods.name().call),
      symbol: call(ColuLocalNetworkContract.methods.symbol().call),
      totalSupply: call(ColuLocalNetworkContract.methods.totalSupply().call),
      owner: call(ColuLocalNetworkContract.methods.owner().call),
      tokenURI: call(ColuLocalNetworkContract.methods.tokenURI().call),
      mmAddress: call(CurrencyFactoryContract.methods.getMarketMakerAddressFromToken(contractAddress).call)
    }

    // wait untill web3 is ready
    yield onWeb3Ready

    if (web3.eth.defaultAccount) {
      calls.balanceOf = call(ColuLocalNetworkContract.methods.balanceOf(web3.eth.defaultAccount).call)
    }

    const response = yield all(calls)
    response.isLocalCurrency = true
    response.address = contractAddress
    response.path = '/view/community/' + response.name.toLowerCase().replace(/ /g, '')

    if (response.tokenURI) {
      const [protocol, hash] = response.tokenURI.split('://')
      yield put({
        type: FETCH_METADATA.REQUEST,
        protocol,
        hash,
        contractAddress
      })

      // wait until timeout to receive the metadata
      yield race({
        metadata: take(action =>
          action.type === FETCH_METADATA.SUCCESS && action.contractAddress === contractAddress),
        timeout: call(delay, CONFIG.api.timeout)
      })
    }

    yield put({
      type: marketMakerActions.GET_CURRENT_PRICE.REQUEST,
      address: response.mmAddress,
      contractAddress
    })
    yield put({
      type: marketMakerActions.CLN_RESERVE.REQUEST,
      address: response.mmAddress,
      contractAddress
    })
    yield put({
      type: marketMakerActions.CC_RESERVE.REQUEST,
      address: response.mmAddress,
      contractAddress
    })

    yield entityPut({type: actions.FETCH_COMMUNITY_CONTRACT.SUCCESS,
      contractAddress,
      response
    })
  } catch (error) {
    console.error(error)
    yield entityPut({type: actions.FETCH_COMMUNITY_CONTRACT.FAILURE, contractAddress, error})
  }
}

export function * fetchClnContract ({contractAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})

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
    response.address = contractAddress
    ReactGA.event({
      category: 'Metamask',
      action: 'CLN balance',
      label: response.balanceOf > 0 ? 'Yes' : 'No'
    })

    yield entityPut({type: actions.FETCH_CLN_CONTRACT.SUCCESS,
      contractAddress,
      response
    })
  } catch (error) {
    console.error(error)
    yield entityPut({type: actions.FETCH_CLN_CONTRACT.FAILURE, contractAddress, error})
  }
}

export function * watchTransferSuccess () {
  while (true) {
    const {receipt} = yield take(actions.TRANSFER.SUCCESS)
    yield entityPut({type: actions.BALANCE_OF.REQUEST, address: receipt.from})
  }
}

export function * watchSelectAccount () {
  while (true) {
    const {response} = yield take(SELECT_ACCOUNT)
    const addresses = yield select(getAddresses)
    const contractAddress = addresses.ColuLocalNetwork
    yield entityPut({type: actions.BALANCE_OF.REQUEST, contractAddress, address: response.account})
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
    fork(watchTransferSuccess),
    fork(watchSelectAccount)
  ])
}
