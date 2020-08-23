import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'
import has from 'lodash/has'

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
