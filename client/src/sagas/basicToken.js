import { all, put, call, take, takeEvery, fork } from 'redux-saga/effects'

import {createEntityPut} from './utils'
import * as actions from 'actions/basicToken'
import * as marketMakerActions from 'actions/marketMaker'
import web3, {onWeb3Ready} from 'services/web3'
import { contract } from 'osseus-wallet'
import addresses from 'constants/addresses'
import * as api from 'services/api'

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

export function * fetchContractData ({contractAddress}) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: contractAddress})
    const CurrencyFactoryContract = contract.getContract({contractName: 'CurrencyFactory'})

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

    if (contractAddress !== addresses.ColuLocalNetwork) {
      calls.tokenURI = call(ColuLocalNetworkContract.methods.tokenURI().call)
      calls.mmAddress = call(CurrencyFactoryContract.methods.getMarketMakerAddressFromToken(contractAddress).call)
    }

    const response = yield all(calls)
    response.address = contractAddress

    if (response.tokenURI) {
      const [protocol, hash] = response.tokenURI.split('://')
      const {data} = yield api.fetchMetadata(protocol, hash)
      response.metadata = data.metadata
    }

    if (response.mmAddress) {
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
    }

    yield entityPut({type: actions.FETCH_CONTRACT_DATA.SUCCESS,
      contractAddress,
      response
    })
  } catch (error) {
    console.error(error)
    yield entityPut({type: actions.FETCH_CONTRACT_DATA.FAILURE, contractAddress, error})
  }
}

export function * watchTransferSuccess () {
  while (true) {
    const {receipt} = yield take(actions.TRANSFER.SUCCESS)
    yield entityPut({type: actions.BALANCE_OF.REQUEST, address: receipt.from})
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
    takeEvery(actions.FETCH_CONTRACT_DATA.REQUEST, fetchContractData),
    fork(watchTransferSuccess)
  ])
}
