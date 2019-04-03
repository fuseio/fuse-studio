import { all, call, put, select } from 'redux-saga/effects'

import {getContract} from 'services/contract'
import * as actions from 'actions/directory'
import {apiCall, createEntitiesFetch, tryTakeEvery} from './utils'
import {getAccountAddress} from 'selectors/accounts'
import {getAddress} from 'selectors/network'
import {createMetadata} from 'sagas/metadata'
import {isZeroAddress} from 'utils/web3'
import {processReceipt} from 'services/api/misc'
import * as api from 'services/api/business'
import web3 from 'services/web3'

function * createList ({tokenAddress}) {
  const accountAddress = yield select(getAccountAddress)
  const contractAddress = yield select(getAddress, 'SimpleListFactory')
  const SimpleListFactoryContract = getContract({abiName: 'SimpleListFactory',
    address: contractAddress
  })

  // Using sendTransaction because the regulat way of myContract.method doesn't return on success
  // (Web3 bug)
  const method = SimpleListFactoryContract.methods.createSimpleList(tokenAddress)
  yield web3.eth.sendTransaction({
    from: accountAddress,
    to: contractAddress,
    data: method.encodeABI(),
    gasPrice: 1e9
  })

  yield put({type: actions.GET_LIST.REQUEST, tokenAddress})
  yield put({type: actions.CREATE_LIST.SUCCESS})
}

function * getList ({tokenAddress}) {
  const contractAddress = yield select(getAddress, 'SimpleListFactory')
  const options = {bridgeType: 'home'}
  const SimpleListFactoryContract = getContract({
    abiName: 'SimpleListFactory',
    address: contractAddress,
    options
  })

  const listAddress = yield SimpleListFactoryContract.methods.tokenToListMap(tokenAddress).call()

  yield put({type: actions.GET_LIST.SUCCESS,
    response: {
      listAddress: isZeroAddress(listAddress) ? null : listAddress
    }})
  return listAddress
}

function * addEntity ({listAddress, data}) {
  const accountAddress = yield select(getAccountAddress)
  const SimpleListContract = getContract({abiName: 'SimpleList',
    address: listAddress
  })

  const {hash} = yield call(createMetadata, {metadata: data})
  const method = SimpleListContract.methods.addEntity(hash)
  const receipt = yield method.send({
    from: accountAddress
  })

  yield apiCall(processReceipt, {receipt})

  yield put({type: actions.ADD_ENTITY.SUCCESS,
    response: {
      receipt
    }
  })

  return receipt
}

function * removeEntity ({listAddress, hash}) {
  const accountAddress = yield select(getAccountAddress)
  const SimpleListContract = getContract({abiName: 'SimpleList',
    address: listAddress
  })

  const receipt = yield SimpleListContract.methods.deleteEntity(hash).send({
    from: accountAddress
  })

  yield apiCall(processReceipt, {receipt})

  yield put({type: actions.REMOVE_DIRECTORY_ENTITY.SUCCESS,
    response: {
      receipt
    }
  })

  return receipt
}

function * editEntity ({listAddress, hash, data}) {
  const accountAddress = yield select(getAccountAddress)

  const SimpleListContract = getContract({abiName: 'SimpleList',
    address: listAddress
  })

  const response = yield call(createMetadata, {metadata: data})
  const newHash = response.hash

  const receipt = yield SimpleListContract.methods.replaceEntity(hash, newHash).send({
    from: accountAddress
  })

  yield apiCall(processReceipt, {receipt})

  yield put({type: actions.EDIT_ENTITY.SUCCESS,
    response: {
      receipt
    }
  })

  return receipt
}

export function * activateBusiness ({listAddress, hash}) {
  const data = yield select(state => state.entities.metadata[`ipfs://${hash}`])
  const receipt = yield editEntity({listAddress, hash, data: {...data, active: true}})
  yield put({type: actions.ACTIVATE_BUSINESS.SUCCESS,
    response: {
      receipt
    }
  })
}

export function * deactivateBusiness ({listAddress, hash}) {
  const data = yield select(state => state.entities.metadata[`ipfs://${hash}`])
  const receipt = yield editEntity({listAddress, hash, data: {...data, active: false}})
  yield put({type: actions.DEACTIVATE_BUSINESS.SUCCESS,
    response: {
      receipt
    }
  })
}

const fetchBusinesses = createEntitiesFetch(actions.FETCH_BUSINESSES, api.fetchBusinesses)
const fetchBusiness = createEntitiesFetch(actions.FETCH_BUSINESS, api.fetchBusiness)

export default function * businessSaga () {
  yield all([
    tryTakeEvery(actions.CREATE_LIST, createList, 1),
    tryTakeEvery(actions.GET_LIST, getList, 1),
    tryTakeEvery(actions.ADD_ENTITY, addEntity, 1),
    tryTakeEvery(actions.REMOVE_ENTITY, removeEntity, 1),
    tryTakeEvery(actions.EDIT_ENTITY, editEntity, 1),
    tryTakeEvery(actions.FETCH_BUSINESSES, fetchBusinesses, 1),
    tryTakeEvery(actions.FETCH_BUSINESS, fetchBusiness, 1),
    tryTakeEvery(actions.ACTIVATE_BUSINESS, activateBusiness, 1),
    tryTakeEvery(actions.DEACTIVATE_BUSINESS, deactivateBusiness, 1)
  ])
}
