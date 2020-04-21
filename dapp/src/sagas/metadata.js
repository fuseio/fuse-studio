import { all, put, takeEvery } from 'redux-saga/effects'

import { createEntityPut, tryTakeEvery, apiCall } from './utils'
import { get3box } from 'services/web3'
import { separateData } from 'utils/3box'
import { createProfile } from 'services/api/profiles'
import * as metadataApi from 'services/api/metadata'
import * as actions from 'actions/metadata'
import { FETCH_TOKEN } from 'actions/token'
import { imageUpload } from 'services/api/images'
import * as entitiesApi from 'services/api/entities'

const entityPut = createEntityPut(actions.entityName)

function * fetchMetadata ({ tokenURI }) {
  if (!tokenURI) {
    throw new Error(`No tokenURI given`)
  }

  const hash = tokenURI.split('://')[1]

  const { data } = yield apiCall(metadataApi.fetchMetadata, { hash })

  yield entityPut({
    type: actions.FETCH_METADATA.SUCCESS,
    response: {
      entities: {
        [tokenURI]: data
      }
    }
  })
}

export function * createMetadata ({ metadata }) {
  let imageHash
  let coverPhotoHash
  if (metadata && metadata.image) {
    const { hash } = yield apiCall(imageUpload, { image: metadata.image })
    imageHash = hash
  }

  if (metadata && metadata.coverPhoto) {
    const { hash } = yield apiCall(imageUpload, { image: metadata.coverPhoto })
    coverPhotoHash = hash
  }

  let newData = imageHash ? { ...metadata, image: imageHash } : metadata
  newData = coverPhotoHash ? { ...newData, coverPhoto: coverPhotoHash } : newData
  const { data, hash } = yield apiCall(metadataApi.createMetadata, { metadata: { ...newData } })
  yield put({
    type: actions.CREATE_METADATA.SUCCESS,
    response: {
      data
    }
  })
  return { data, hash }
}

export function * createBusinessMetadata ({ communityAddress, accountAddress, metadata }) {
  let image
  let coverPhoto

  if (metadata.image) {
    const { hash } = yield apiCall(imageUpload, { image: metadata.image })
    image = hash
  }

  if (metadata.coverPhoto) {
    const { hash } = yield apiCall(imageUpload, { image: metadata.coverPhoto })
    coverPhoto = hash
  }

  if (image || coverPhoto) {
    let newData = image ? { ...metadata, image } : metadata
    newData = coverPhoto ? { ...newData, coverPhoto } : newData
    const { data, hash } = yield apiCall(entitiesApi.createEntitiesMetadata, { communityAddress, accountAddress, metadata: { ...newData } })
    yield put({
      type: actions.CREATE_METADATA.SUCCESS,
      response: {
        data
      }
    })
    return { data, hash }
  } else {
    const { data, hash } = yield apiCall(entitiesApi.createEntitiesMetadata, { communityAddress, accountAddress, metadata })
    yield put({
      type: actions.CREATE_METADATA.SUCCESS,
      response: {
        data
      }
    })
    return { data, hash }
  }
}

const fetchPic = buffer => window.fetch('https://ipfs.infura.io:5001/api/v0/add', {
  method: 'post',
  'Content-Type': 'multipart/form-data',
  body: buffer
})

export function * createUsersMetadata ({ accountAddress, metadata }) {
  const box = yield get3box({ accountAddress })

  const getImageHash = async (image) => {
    const formData = new window.FormData()
    formData.append('path', new window.Blob([image]))
    const response = await fetchPic(formData)
    const { Hash } = await response.json()
    return [{ '@type': 'ImageObject', contentUrl: { '/': Hash } }]
  }

  let image
  let coverPhoto

  if (metadata.image) {
    image = yield getImageHash(metadata.image)
  }

  if (metadata.coverPhoto) {
    coverPhoto = yield getImageHash(metadata.coverPhoto)
  }

  let newMetadata
  newMetadata = image ? { ...metadata, image } : metadata
  newMetadata = coverPhoto ? { ...newMetadata, coverPhoto } : newMetadata
  const { publicData, privateData } = separateData(newMetadata)
  const publicFields = Object.keys(publicData)
  const publicValues = Object.values(publicData)
  yield box.public.setMultiple(publicFields, publicValues)

  const privateFields = Object.keys(privateData)
  const privateValues = Object.values(privateData)
  yield box.private.setMultiple(privateFields, privateValues)
  yield apiCall(createProfile, { accountAddress, publicData })

  yield put({
    type: actions.CREATE_ENTITY_METADATA.SUCCESS
  })
}

function * watchTokensFetched ({ response }) {
  const { result, entities } = response
  for (let tokenAddress of result) {
    const token = entities[tokenAddress]
    if (token && token.tokenURI) {
      yield put(actions.fetchMetadata(token.tokenURI))
    }
  }
}

function * watchEntitiesFetched ({ response }) {
  const { result, entities } = response
  for (let account of result) {
    const entity = entities[account]
    yield put(actions.fetchMetadata(entity.uri))
  }
}

export default function * apiSaga () {
  yield all([
    tryTakeEvery(actions.FETCH_METADATA, fetchMetadata, 1),
    tryTakeEvery(actions.CREATE_METADATA, createMetadata, 1),
    takeEvery(action => /^FETCH_TOKENS.*SUCCESS/.test(action.type), watchTokensFetched),
    takeEvery(action => /^(FETCH_BUSINESS|FETCH_ENTITY).*SUCCESS/.test(action.type), watchEntitiesFetched),
    takeEvery(FETCH_TOKEN.SUCCESS, watchTokensFetched)
  ])
}
