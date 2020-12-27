import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'
import has from 'lodash/has'
import { imageUpload } from 'services/api/images'
import { createEntitiesMetadata } from 'services/api/entities'

export const isIpfsHash = (hash) => hash != null && hash.length === 46
export const isS3Hash = (hash) => hash != null && hash.length === 64

export const getImageUri = (metadata) => get(metadata, 'imageUri') ||
  (!isEmpty(get(metadata, 'image'))
    ? `${CONFIG.ipfsProxy.urlBase}/image/${get(metadata, 'image')}`
    : null)

export const getCoverPhotoUri = (metadata) => {
  if (get(metadata, 'coverPhotoUri')) {
    return get(metadata, 'coverPhotoUri')
  }
  if (!has(metadata, 'coverPhoto')) {
    return
  }
  const coverPhoto = get(metadata, 'coverPhoto')
  if (typeof coverPhoto !== 'string') {
    return
  }
  if (coverPhoto.includes('://')) {
    return coverPhoto
  }
  return `${CONFIG.ipfsProxy.urlBase}/image/${metadata.coverPhoto}`
}


export async function createBusinessMetadata ({ communityAddress, accountAddress, metadata }, { baseUrl }) {
  let image
  let coverPhoto
  debugger
  if (metadata.image) {
    const { hash } = await imageUpload(baseUrl, { image: metadata.image })
    image = hash
  }

  if (metadata.coverPhoto) {
    const { hash } = await imageUpload(baseUrl, { image: metadata.coverPhoto })
    coverPhoto = hash
  }

  if (image || coverPhoto) {
    let newData = image ? { ...metadata, image } : metadata
    newData = coverPhoto ? { ...newData, coverPhoto } : newData
    const { data, hash } = await createEntitiesMetadata(baseUrl, { communityAddress, accountAddress, metadata: { ...newData } })
    return { data, hash }
  } else {
    const { data, hash } = await createEntitiesMetadata(baseUrl, { communityAddress, accountAddress, metadata })
    return { data, hash }
  }
}