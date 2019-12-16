import { all, call, put, select, takeEvery } from 'redux-saga/effects'

import * as actions from 'actions/communityEntities'
import { createEntitiesFetch, tryTakeEvery, apiCall } from './utils'
import { getAccountAddress } from 'selectors/accounts'
import { getCommunityAddress } from 'selectors/entities'
import { createBusinessMetadata, createUsersMetadata } from 'sagas/metadata'
import * as entitiesApi from 'services/api/entities'
import { transactionFlow } from './transaction'
import { roles, combineRoles } from '@fuse/roles'
import Box from '3box'
import { separateData } from 'utils/3box'
import { createProfile } from 'services/api/profiles'
import { uploadImage as uploadImageApi } from 'services/api/images'
import omit from 'lodash/omit'
import CommunityABI from '@fuse/entities-contracts/abi/CommunityWithEvents'
import CommunityTransferManagerABI from '@fuse/entities-contracts/abi/CommunityTransferManager'
import { getWeb3 } from 'services/web3'
import { getOptions, getNetworkVersion } from 'utils/network'

function * confirmUser ({ account }) {
  const communityAddress = yield select(getCommunityAddress)
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, getOptions(networkVersion))
  const method = CommunityContract.methods.addEnitityRoles(account, roles.APPROVED_ROLE)
  const transactionPromise = method.send({
    from: accountAddress
  })

  const action = actions.CONFIRM_USER
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, abiName: 'Community' })
}

function * toggleCommunityMode ({ communityAddress, isClosed }) {
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const CommunityContract = new web3.eth.Contract(CommunityTransferManagerABI, communityAddress, getOptions(networkVersion))
  const method = !isClosed
    ? CommunityContract.methods.addRule(roles.APPROVED_ROLE, roles.APPROVED_ROLE)
    : CommunityContract.methods.removeRule(0)

  const transactionPromise = method.send({
    from: accountAddress
  })
  yield call(transactionFlow, { transactionPromise, action: actions.TOGGLE_COMMUNITY_MODE, sendReceipt: true, abiName: 'CommunityTransferManager' })
}

function * addAdminRole ({ account }) {
  const communityAddress = yield select(getCommunityAddress)
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, getOptions(networkVersion))

  const method = CommunityContract.methods.addEnitityRoles(account, combineRoles(roles.ADMIN_ROLE, roles.APPROVED_ROLE))
  const transactionPromise = method.send({
    from: accountAddress
  })

  const action = actions.ADD_ADMIN_ROLE
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, abiName: 'Community' })
}

function * removeAdminRole ({ account }) {
  const communityAddress = yield select(getCommunityAddress)
  const accountAddress = yield select(getAccountAddress)
  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, getOptions(networkVersion))

  const method = CommunityContract.methods.removeEnitityRoles(account, roles.ADMIN_ROLE)
  const transactionPromise = method.send({
    from: accountAddress
  })

  const action = actions.REMOVE_ADMIN_ROLE
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, abiName: 'Community' })
}

function deriveEntityData (type, isClosed) {
  if (type === 'user') {
    return { entityRoles: isClosed ? roles.USER_ROLE : combineRoles(roles.APPROVED_ROLE, roles.USER_ROLE) }
  } else if (type === 'business') {
    return { entityRoles: roles.BUSINESS_ROLE }
  }
}

function * checkIsCommunityMember ({ communityAddress, account }) {
  const memberData = yield apiCall(entitiesApi.fetchEntity, { communityAddress, account })
  return memberData && memberData.data
}

function * addEntity ({ communityAddress, data, isClosed, entityType }) {
  const isCommunityMember = yield call(checkIsCommunityMember, { communityAddress, account: data.account })
  if (entityType === 'business' && isCommunityMember) {
    const accountAddress = yield select(getAccountAddress)
    const web3 = yield getWeb3()
    const networkVersion = getNetworkVersion(web3)
    const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, getOptions(networkVersion))
    const method = CommunityContract.methods.addEnitityRoles(data.account, roles.BUSINESS_ROLE)
    const transactionPromise = method.send({
      from: accountAddress
    })
    const action = actions.ADD_ENTITY
    yield call(createBusinessMetadata, { communityAddress, accountAddress: data.account, metadata: data })
    yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, abiName: 'Community' })
  } else {
    if (entityType === 'business') {
      yield call(createBusinessMetadata, { communityAddress, accountAddress: data.account, metadata: data })
    } else {
      yield call(metadataHandler, { communityAddress, data })
    }

    const { entityRoles } = deriveEntityData(entityType, isClosed)

    const accountAddress = yield select(getAccountAddress)
    const web3 = yield getWeb3()
    const networkVersion = getNetworkVersion(web3)
    const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, getOptions(networkVersion))

    const method = CommunityContract.methods.addEntity(data.account, entityRoles)
    const transactionPromise = method.send({
      from: accountAddress
    })
    const action = actions.ADD_ENTITY
    yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, abiName: 'Community' })
  }
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

  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, getOptions(networkVersion))

  const method = CommunityContract.methods.join()
  const transactionPromise = method.send({
    from: accountAddress
  })
  const action = actions.ADD_ENTITY
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, abiName: 'Community' })

  yield put({
    type: actions.JOIN_COMMUNITY.SUCCESS
  })
}

function * removeEntity ({ account }) {
  const accountAddress = yield select(getAccountAddress)
  const communityAddress = yield select(getCommunityAddress)
  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, getOptions(networkVersion))

  const method = CommunityContract.methods.removeEntity(account)
  const transactionPromise = method.send({
    from: accountAddress
  })

  const action = actions.REMOVE_ENTITY
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, abiName: 'Community' })
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

  const web3 = yield getWeb3()
  const networkVersion = getNetworkVersion(web3)
  const CommunityContract = new web3.eth.Contract(CommunityABI, communityAddress, getOptions(networkVersion))

  const method = CommunityContract.methods.addEntity(accountAddress, entityRoles)
  const transactionPromise = method.send({
    from: adminAccountAddress
  })
  const action = actions.ADD_ENTITY
  const { publicData } = separateData(omit({ ...profile, type: 'user' }, ['ethereum_proof', 'proof_did']))
  yield apiCall(createProfile, { accountAddress, publicData })
  yield call(transactionFlow, { transactionPromise, action, sendReceipt: true, abiName: 'Community' })

  yield put({
    type: actions.IMPORT_EXISTING_ENTITY.SUCCESS
  })
}

function * uploadImage ({ image }) {
  const data = yield call(uploadImageApi, { image })
  return data.json()
}

const fetchEntities = createEntitiesFetch(actions.FETCH_ENTITIES, entitiesApi.fetchCommunityEntities)
const fetchUsersEntities = createEntitiesFetch(actions.FETCH_USERS_ENTITIES, entitiesApi.fetchCommunityEntities)
const fetchBusinessesEntities = createEntitiesFetch(actions.FETCH_BUSINESSES_ENTITIES, entitiesApi.fetchCommunityEntities)
const fetchEntity = createEntitiesFetch(actions.FETCH_ENTITY, entitiesApi.fetchEntity)

export default function * communityEntitiesSaga () {
  yield all([
    tryTakeEvery(actions.ADD_ENTITY, addEntity, 1),
    tryTakeEvery(actions.TOGGLE_COMMUNITY_MODE, toggleCommunityMode, 1),
    tryTakeEvery(actions.REMOVE_ENTITY, removeEntity, 1),
    tryTakeEvery(actions.FETCH_ENTITIES, fetchEntities, 1),
    tryTakeEvery(actions.FETCH_USERS_ENTITIES, fetchUsersEntities, 1),
    tryTakeEvery(actions.FETCH_BUSINESSES_ENTITIES, fetchBusinessesEntities, 1),
    tryTakeEvery(actions.FETCH_ENTITY, fetchEntity, 1),
    tryTakeEvery(actions.ADD_ADMIN_ROLE, addAdminRole, 1),
    tryTakeEvery(actions.REMOVE_ADMIN_ROLE, removeAdminRole, 1),
    tryTakeEvery(actions.CONFIRM_USER, confirmUser, 1),
    tryTakeEvery(actions.JOIN_COMMUNITY, joinCommunity, 1),
    tryTakeEvery(actions.IMPORT_EXISTING_ENTITY, importExistingEntity, 1),
    tryTakeEvery(actions.UPLOAD_IMAGE, uploadImage, 1),
    takeEvery(action => /^(ADD_ENTITY|REMOVE_ENTITY|ADD_ADMIN_ROLE|REMOVE_ADMIN_ROLE|CONFIRM_USER).*SUCCESS/.test(action.type), watchEntityChanges)
  ])
}
