import { all, call, put, take, fork } from 'redux-saga/effects'

import * as actions from 'actions/basicToken'
import web3 from 'services/web3'
import { contract } from 'osseus-wallet'
import addresses from 'constants/addresses'
// const ColuLocalNetworkContract = contract.getContract({contractName: 'ColuLocalNetwork'})

export function * name (contractAddress) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalNetwork', address: contractAddress})
    const name = yield call(ColuLocalNetworkContract.methods.name().call)
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
    const symbol = yield call(ColuLocalNetworkContract.methods.symbol().call)
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
    const totalSupply = yield call(ColuLocalNetworkContract.methods.totalSupply().call)
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
    const metadata = yield call(ColuLocalNetworkContract.methods.metadata().call)
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
    const owner = yield call(ColuLocalNetworkContract.methods.owner().call)
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
    const balanceOf = yield call(ColuLocalNetworkContract.methods.balanceOf(address).call)
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

export function * fetchContractData (contractAddress) {
  try {
    const ColuLocalNetworkContract = contract.getContract({abiName: 'ColuLocalCurrency', address: contractAddress})

    const calls = [
      call(ColuLocalNetworkContract.methods.name().call),
      call(ColuLocalNetworkContract.methods.symbol().call),
      call(ColuLocalNetworkContract.methods.totalSupply().call),
      call(ColuLocalNetworkContract.methods.owner().call)
    ]

    if (contractAddress !== addresses.ColuLocalNetwork) {
      calls.push(call(ColuLocalNetworkContract.methods.metadata().call))
    }

    const [name, symbol, totalSupply, owner, metadata] = yield all(calls)
    yield put({type: actions.FETCH_CONTRACT_DATA.SUCCESS,
      contractAddress,
      response: {
        name,
        symbol,
        totalSupply,
        owner,
        metadata
      }})
    if (metadata) {
      console.log('fetchhhhh')
    }
  } catch (error) {
    console.error(error)
    yield put({type: actions.FETCH_CONTRACT_DATA.FAILURE, contractAddress, error})
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

export function * watchFetchContractData () {
  while (true) {
    const {contractAddress} = yield take(actions.FETCH_CONTRACT_DATA.REQUEST)
    yield fork(fetchContractData, contractAddress)
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
    fork(watchTransfer),
    fork(watchFetchContractData)
  ])
}
