import { all, call, put, select, takeEvery } from 'redux-saga/effects'

import { getContract } from 'services/contract'
import * as actions from 'actions/communityEntities'
import { apiCall, createEntitiesFetch, tryTakeEvery } from './utils'
import { getAccountAddress } from 'selectors/accounts'
import { getCommunityAddress } from 'selectors/entities'
import { createEntitiesMetadata } from 'sagas/metadata'
import * as tokenApi from 'services/api/token'
import * as entitiesApi from 'services/api/entities'
import { transactionFlow } from './transaction'
import { roles } from '@fuse/roles'

function * confirmUser ({ account }) {
  const communityAddress = yield select(getCommunityAddress)
  const accountAddress = yield select(getAccountAddress)
  const CommunityContract = getContract({ abiName: 'Community',
    address: communityAddress
  })

  const method = CommunityContract.methods.addEnitityRoles(account, roles.APPROVED_ROLE)
  const transactionPromise = method.send({
    from: accountAddress
  })

  const action = actions.CONFIRM_USER
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
}

function * toggleCommunityMode ({ communityAddress, isClosed }) {
  const accountAddress = yield select(getAccountAddress)
  const CommunityContract = getContract({ abiName: 'CommunityTransferManager',
    address: communityAddress
  })
  if (isClosed) {
    const method = CommunityContract.methods.addRule(roles.APPROVED_ROLE, roles.APPROVED_ROLE)
    const transactionPromise = method.send({
      from: accountAddress
    })
    const action = actions.TOGGLE_COMMNITY_MODE
    yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
  } else {
    const method = CommunityContract.methods.removeRule(0)
    const transactionPromise = method.send({
      from: accountAddress
    })
    const action = actions.TOGGLE_COMMNITY_MODE
    yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
  }
}

function * addAdminRole ({ account }) {
  const communityAddress = yield select(getCommunityAddress)
  const accountAddress = yield select(getAccountAddress)
  const CommunityContract = getContract({ abiName: 'Community',
    address: communityAddress
  })

  const method = CommunityContract.methods.addEnitityRoles(account, roles.ADMIN_ROLE)
  const transactionPromise = method.send({
    from: accountAddress
  })

  const action = actions.ADD_ADMIN_ROLE
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
}

function * removeAdminRole ({ account }) {
  const communityAddress = yield select(getCommunityAddress)
  const accountAddress = yield select(getAccountAddress)
  const CommunityContract = getContract({ abiName: 'Community',
    address: communityAddress
  })

  const method = CommunityContract.methods.removeEnitityRoles(account, roles.ADMIN_ROLE)
  const transactionPromise = method.send({
    from: accountAddress
  })

  const action = actions.REMOVE_ADMIN_ROLE
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
}

function * addUser ({ communityAddress, data }) {
  const accountAddress = yield select(getAccountAddress)
  const CommunityContract = getContract({ abiName: 'Community',
    address: communityAddress
  })
  const method = CommunityContract.methods.addEntity(data.account, roles.USER_ROLE)
  const transactionPromise = method.send({
    from: accountAddress
  })

  const action = actions.ADD_ENTITY
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
  yield call(createEntitiesMetadata, { communityAddress, accountId: data.account, metadata: data })
}

function * addBusiness ({ communityAddress, data }) {
  const accountAddress = yield select(getAccountAddress)
  const CommunityContract = getContract({ abiName: 'Community',
    address: communityAddress
  })
  const method = CommunityContract.methods.addEntity(data.account, roles.BUSINESS_ROLE)
  const transactionPromise = method.send({
    from: accountAddress
  })
  const action = actions.ADD_ENTITY
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
  yield call(createEntitiesMetadata, { communityAddress, accountId: data.account, metadata: data })
}

function * addEntity ({ communityAddress, data }) {
  if (data.type === 'user') {
    yield call(addUser, { communityAddress, data })
  } else if (data.type === 'business') {
    yield call(addBusiness, { communityAddress, data })
  }
}

function * removeEntity ({ communityAddress, account }) {
  const accountAddress = yield select(getAccountAddress)
  const CommunityContract = getContract({ abiName: 'Community',
    address: communityAddress
  })
  const method = CommunityContract.methods.removeEntity(account)
  const transactionPromise = method.send({
    from: accountAddress
  })

  const action = actions.REMOVE_ENTITY
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
}

function * fetchCommunity ({ tokenAddress }) {
  const { data } = yield apiCall(tokenApi.fetchCommunity, { tokenAddress })
  yield put({ type: actions.FETCH_COMMUNITY.SUCCESS,
    response: {
      ...data
    }
  })
}

function * watchEntityChanges ({ response }) {
  const communityAddress = yield select(getCommunityAddress)
  const { data } = response

  if (data) {
    const { type } = data
    if (type === 'user') {
      yield put(actions.fetchUsersEntities(communityAddress))
    } else if (type === 'business') {
      yield put(actions.fetchBusinessesEntities(communityAddress))
    }
  } else {
    yield put(actions.fetchUsersEntities(communityAddress))
    yield put(actions.fetchBusinessesEntities(communityAddress))
  }
}

const fetchUsersEntities = createEntitiesFetch(actions.FETCH_USERS_ENTITIES, entitiesApi.fetchCommunityEntities)
const fetchBusinessesEntities = createEntitiesFetch(actions.FETCH_BUSINESSES_ENTITIES, entitiesApi.fetchCommunityEntities)
const fetchEntity = createEntitiesFetch(actions.FETCH_ENTITY, entitiesApi.fetchEntity)

export default function * commuityEntitiesSaga () {
  yield all([
    tryTakeEvery(actions.ADD_ENTITY, addEntity, 1),
    tryTakeEvery(actions.TOGGLE_COMMNITY_MODE, toggleCommunityMode, 1),
    tryTakeEvery(actions.REMOVE_ENTITY, removeEntity, 1),
    tryTakeEvery(actions.FETCH_COMMUNITY, fetchCommunity, 1),
    tryTakeEvery(actions.FETCH_USERS_ENTITIES, fetchUsersEntities, 1),
    tryTakeEvery(actions.FETCH_BUSINESSES_ENTITIES, fetchBusinessesEntities, 1),
    tryTakeEvery(actions.FETCH_ENTITY, fetchEntity, 1),
    tryTakeEvery(actions.ADD_ADMIN_ROLE, addAdminRole, 1),
    tryTakeEvery(actions.REMOVE_ADMIN_ROLE, removeAdminRole, 1),
    tryTakeEvery(actions.CONFIRM_USER, confirmUser, 1),
    takeEvery(action => /^(CREATE_METADATA|REMOVE_ENTITY|ADD_ADMIN_ROLE|REMOVE_ADMIN_ROLE|CONFIRM_USER).*SUCCESS/.test(action.type), watchEntityChanges)
  ])
}
