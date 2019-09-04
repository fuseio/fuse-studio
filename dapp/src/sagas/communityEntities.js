import { all, call, put, select, takeEvery } from 'redux-saga/effects'

import { getContract } from 'services/contract'
import * as actions from 'actions/communityEntities'
import { createEntitiesFetch, tryTakeEvery, apiCall } from './utils'
import { getAccountAddress } from 'selectors/accounts'
import { getCommunityAddress } from 'selectors/entities'
import { createBusinessMetadata, createMetadata, createUsersMetadata } from 'sagas/metadata'
import * as entitiesApi from 'services/api/entities'
import { transactionFlow } from './transaction'
import { roles, combineRoles } from '@fuse/roles'
import Box from '3box'
import { separateData } from 'utils/3box'
import { createProfile } from 'services/api/profiles'
import { uploadImage as uploadImageApi } from 'services/api/images'
import omit from 'lodash/omit'

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
  if (!isClosed) {
    const method = CommunityContract.methods.addRule(roles.APPROVED_ROLE, roles.APPROVED_ROLE)
    const transactionPromise = method.send({
      from: accountAddress
    })
    const action = actions.TOGGLE_COMMUNITY_MODE
    yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
  } else {
    const method = CommunityContract.methods.removeRule(0)
    const transactionPromise = method.send({
      from: accountAddress
    })
    const action = actions.TOGGLE_COMMUNITY_MODE
    yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
  }
}

function * addAdminRole ({ account }) {
  const communityAddress = yield select(getCommunityAddress)
  const accountAddress = yield select(getAccountAddress)
  const CommunityContract = getContract({ abiName: 'Community',
    address: communityAddress
  })

  const method = CommunityContract.methods.addEnitityRoles(account, combineRoles(roles.ADMIN_ROLE, roles.APPROVED_ROLE))
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

function deriveEntityData (type, isClosed) {
  if (type === 'user') {
    return { entityRoles: isClosed ? roles.USER_ROLE : combineRoles(roles.APPROVED_ROLE, roles.USER_ROLE) }
  } else if (type === 'business') {
    return { entityRoles: roles.BUSINESS_ROLE }
  }
}

function * addEntity ({ communityAddress, data, isClosed, entityType }) {
  if (entityType === 'business') {
    yield call(createBusinessMetadata, { communityAddress, accountAddress: data.account, metadata: data })
  } else {
    yield call(metadataHandler, { communityAddress, data })
  }

  const { entityRoles } = deriveEntityData(entityType, isClosed)

  const accountAddress = yield select(getAccountAddress)
  const CommunityContract = getContract({ abiName: 'Community',
    address: communityAddress
  })
  const method = CommunityContract.methods.addEntity(data.account, entityRoles)
  const transactionPromise = method.send({
    from: accountAddress
  })
  const action = actions.ADD_ENTITY
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
}

function * metadataHandler ({ communityAddress, data }) {
  const getImageHash = async (image) => {
    const formData = new window.FormData()
    formData.append('path', new window.Blob([image]))
    const response = await fetchPic(formData)
    const { Hash } = await response.json()
    return [{ '@type': 'ImageObject', contentUrl: { '/': Hash } }]
  }

  let image
  let coverPhoto

  if (data.image) {
    image = yield getImageHash(data.image)
  }

  if (data.coverPhoto) {
    coverPhoto = yield getImageHash(data.coverPhoto)
  }

  if (image || coverPhoto) {
    let newData = image ? { ...data, image } : data
    newData = coverPhoto ? { ...newData, coverPhoto } : newData
    yield call(createUsersMetadata, { communityAddress, accountAddress: data.account, metadata: { ...newData } })
  } else {
    yield call(createUsersMetadata, { communityAddress, accountAddress: data.account, metadata: data })
  }
}

const fetchPic = buffer => window.fetch('https://ipfs.infura.io:5001/api/v0/add', {
  method: 'post',
  'Content-Type': 'multipart/form-data',
  body: buffer
})

function * joinCommunity ({ communityAddress, data }) {
  const accountAddress = yield select(getAccountAddress)
  yield call(metadataHandler, { communityAddress, data })

  const CommunityContract = getContract({ abiName: 'Community',
    address: communityAddress
  })
  const method = CommunityContract.methods.join()
  const transactionPromise = method.send({
    from: accountAddress
  })
  const action = actions.ADD_ENTITY
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
  yield put({
    type: actions.JOIN_COMMUNITY.SUCCESS
  })
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

function * importExistingEntity ({ accountAddress, communityAddress, isClosed }) {
  const profile = yield Box.getProfile(accountAddress)
  const { entityRoles } = deriveEntityData(omit('user', ['ethereum_proof', 'proof_did']), isClosed)

  const adminAccountAddress = yield select(getAccountAddress)

  const CommunityContract = getContract({ abiName: 'Community',
    address: communityAddress
  })
  const method = CommunityContract.methods.addEntity(accountAddress, entityRoles)
  const transactionPromise = method.send({
    from: adminAccountAddress
  })
  const action = actions.ADD_ENTITY
  const { publicData } = separateData(omit({ ...profile, type: 'user' }, ['ethereum_proof', 'proof_did']))
  yield apiCall(createProfile, { accountAddress, publicData })
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true })
  yield put({
    type: actions.IMPORT_EXISTING_ENTITY.SUCCESS
  })
}

function * uploadImage ({ image }) {
  const data = yield call(uploadImageApi, { image })
  return data.json()
}

const fetchUsersEntities = createEntitiesFetch(actions.FETCH_USERS_ENTITIES, entitiesApi.fetchCommunityEntities)
const fetchBusinessesEntities = createEntitiesFetch(actions.FETCH_BUSINESSES_ENTITIES, entitiesApi.fetchCommunityEntities)
const fetchEntity = createEntitiesFetch(actions.FETCH_ENTITY, entitiesApi.fetchEntity)

export default function * communityEntitiesSaga () {
  yield all([
    tryTakeEvery(actions.ADD_ENTITY, addEntity, 1),
    tryTakeEvery(actions.TOGGLE_COMMUNITY_MODE, toggleCommunityMode, 1),
    tryTakeEvery(actions.REMOVE_ENTITY, removeEntity, 1),
    tryTakeEvery(actions.FETCH_USERS_ENTITIES, fetchUsersEntities, 1),
    tryTakeEvery(actions.FETCH_BUSINESSES_ENTITIES, fetchBusinessesEntities, 1),
    tryTakeEvery(actions.FETCH_ENTITY, fetchEntity, 1),
    tryTakeEvery(actions.ADD_ADMIN_ROLE, addAdminRole, 1),
    tryTakeEvery(actions.REMOVE_ADMIN_ROLE, removeAdminRole, 1),
    tryTakeEvery(actions.CONFIRM_USER, confirmUser, 1),
    tryTakeEvery(actions.JOIN_COMMUNITY, joinCommunity, 1),
    tryTakeEvery(actions.IMPORT_EXISTING_ENTITY, importExistingEntity, 1),
    tryTakeEvery(actions.UPLOAD_IMAGE, uploadImage, 1),
    takeEvery(action => /^(CREATE_METADATA|ADD_ENTITY|REMOVE_ENTITY|ADD_ADMIN_ROLE|REMOVE_ADMIN_ROLE|CONFIRM_USER).*SUCCESS/.test(action.type), watchEntityChanges)
  ])
}
