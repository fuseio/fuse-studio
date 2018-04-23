import { all, put, take, fork } from 'redux-saga/effects'

import * as actions from 'actions/basicToken'
import web3 from 'services/web3'
import { contract } from 'osseus-wallet'

// const ColuLocalNetworkContract = contract.getContract({contractName: 'ColuLocalNetwork'})

export function * name (contractAddress) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})
    const name = yield ColuLocalNetworkContract.methods.name().call()
    yield put({type: actions.NAME.SUCCESS,
      contractAddress,
      response: {
        name
      }})
  } catch (error) {
    yield put({type: actions.NAME.FAILURE, error})
  }
}

export function * symbol (contractAddress) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})
    const symbol = yield ColuLocalNetworkContract.methods.symbol().call()
    yield put({type: actions.SYMBOL.SUCCESS,
      contractAddress,
      response: {
        symbol
      }})
  } catch (error) {
    yield put({type: actions.SYMBOL.FAILURE, error})
  }
}

export function * totalSupply (contractAddress) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})
    const totalSupply = yield ColuLocalNetworkContract.methods.totalSupply().call()
    yield put({type: actions.TOTAL_SUPPLY.SUCCESS,
      contractAddress,
      response: {
        totalSupply
      }})
  } catch (error) {
    yield put({type: actions.TOTAL_SUPPLY.FAILURE, error})
  }
}

export function * metadata (contractAddress) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: contractAddress})
    const metadata = yield ColuLocalNetworkContract.methods.metadata().call()
    yield put({type: actions.METADATA.SUCCESS,
      contractAddress,
      response: {
        metadata
      }})
  } catch (error) {
    yield put({type: actions.METADATA.FAILURE, error})
  }
}

export function * setMetadata (contractAddress, metadataUri) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: contractAddress})
    console.log(metadataUri)
    const metadata = yield ColuLocalNetworkContract.methods.setMetadata(metadataUri).send({
      from: web3.eth.defaultAccount
    })
    yield put({type: actions.SET_METADATA.SUCCESS,
      contractAddress,
      response: {
        metadata
      }})
  } catch (error) {
    yield put({type: actions.SET_METADATA.FAILURE, error})
  }
}

export function * owner (contractAddress) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: contractAddress})
    const owner = yield ColuLocalNetworkContract.methods.owner().call()
    yield put({type: actions.OWNER.SUCCESS,
      contractAddress,
      response: {
        owner
      }})
  } catch (error) {
    yield put({type: actions.OWNER.FAILURE, error})
  }
}

export function * balanceOf (contractAddress, address) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})
    const balanceOf = yield ColuLocalNetworkContract.methods.balanceOf(address).call()
    yield put({type: actions.BALANCE_OF.SUCCESS,
      contractAddress,
      response: {
        balanceOf
      }})
  } catch (error) {
    yield put({type: actions.BALANCE_OF.FAILURE, error})
  }
}

export function * transfer (contractAddress, to, value) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})
    const receipt = yield ColuLocalNetworkContract.methods.transfer(to, value).send({
      from: web3.eth.defaultAccount
    })
    yield put({type: actions.BALANCE_OF.REQUEST, address: receipt.from})
    yield put({type: actions.TRANSFER.SUCCESS, receipt})
  } catch (error) {
    yield put({type: actions.TRANSFER.FAILURE, error})
  }
}

export function * watchBalanceOf () {
  while (true) {
    const {contractAddress, address} = yield take(actions.BALANCE_OF.REQUEST)
    yield fork(balanceOf, contractAddress, address)
  }
}

export function * watchName () {
  while (true) {
    const {contractAddress} = yield take(actions.NAME.REQUEST)
    yield fork(name, contractAddress)
  }
}

export function * watchSymbol () {
  while (true) {
    const {contractAddress} = yield take(actions.SYMBOL.REQUEST)
    yield fork(symbol, contractAddress)
  }
}

export function * watchTotalSupply () {
  while (true) {
    const {contractAddress} = yield take(actions.TOTAL_SUPPLY.REQUEST)
    yield fork(totalSupply, contractAddress)
  }
}

export function * watchTransfer () {
  while (true) {
    const {contractAddress, to, value} = yield take(actions.TRANSFER.REQUEST)
    yield fork(transfer, contractAddress, to, value)
  }
}

export function * watchMetadata () {
  while (true) {
    const {contractAddress} = yield take(actions.METADATA.REQUEST)
    yield fork(metadata, contractAddress)
  }
}

export function * watchSetMetadata () {
  while (true) {
    const {contractAddress, metadataUri} = yield take(actions.SET_METADATA.REQUEST)
    yield fork(setMetadata, contractAddress, metadataUri)
  }
}

export function * watchOwner () {
  while (true) {
    const {contractAddress} = yield take(actions.OWNER.REQUEST)
    yield fork(owner, contractAddress)
  }
}

export function * watchTransferSuccess () {
  while (true) {
    const {receipt} = yield take(actions.TRANSFER.SUCCESS)
    yield put({type: actions.BALANCE_OF.REQUEST, address: receipt.from})
  }
}

export default function * rootSaga () {
  yield all([
    fork(watchName),
    fork(watchSymbol),
    fork(watchTotalSupply),
    fork(watchMetadata),
    fork(watchSetMetadata),
    fork(watchOwner),
    fork(watchBalanceOf),
    fork(watchTransfer)
  ])
}
