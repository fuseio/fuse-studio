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

export function * createList ({tokenAddress}) {
  const accountAddress = yield select(getAccountAddress)
  const contractAddress = yield select(getAddress, 'SimpleListFactory')
  const SimpleListFactoryContract = getContract({abiName: 'SimpleListFactory',
    address: contractAddress
  })

  const receipt = yield SimpleListFactoryContract.methods.createSimpleList(tokenAddress).send({
    from: accountAddress
  })

  yield put({type: actions.CREATE_LIST.SUCCESS,
    response: {
      listAddress: receipt.events.SimpleListCreated.returnValues.list
    }})

  return receipt
}

export function * getList ({tokenAddress}) {
  const contractAddress = yield select(getAddress, 'SimpleListFactory')
  const SimpleListFactoryContract = getContract({abiName: 'SimpleListFactory',
    address: contractAddress
  })

  const listAddress = yield SimpleListFactoryContract.methods.tokenToListMap(tokenAddress).call()

  yield put({type: actions.GET_LIST.SUCCESS,
    response: {
      listAddress: isZeroAddress(listAddress) ? null : listAddress
    }})
  return listAddress
}

export function * addEntity ({listAddress, data}) {
  const accountAddress = yield select(getAccountAddress)
  const SimpleListContract = getContract({abiName: 'SimpleList',
    address: listAddress
  })

  const {hash} = yield call(createMetadata, {metadata: data})

  const receipt = yield SimpleListContract.methods.addEntity(hash).send({
    from: accountAddress
  })

  yield apiCall(processReceipt, {receipt})

  yield put({type: actions.ADD_DIRECTORY_ENTITY.SUCCESS,
    response: {
      receipt
    }
  })

  return receipt
}

const fetchBusinesses = createEntitiesFetch(actions.FETCH_BUSINESSES, api.fetchBusinesses)

export default function * marketMakerSaga () {
  yield all([
    tryTakeEvery(actions.CREATE_LIST, createList, 1),
    tryTakeEvery(actions.GET_LIST, getList, 1),
    tryTakeEvery(actions.ADD_DIRECTORY_ENTITY, addEntity, 1),
    tryTakeEvery(actions.FETCH_BUSINESSES, fetchBusinesses, 1)
  ])
}
