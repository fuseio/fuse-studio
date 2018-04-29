import {action, createRequestTypes} from './index'

export const IPFS_CAT_FILE = createRequestTypes('IPFS_CAT_FILE')
export const IPFS_ADD_FILE = createRequestTypes('IPFS_ADD_FILE')

export const ipfsCatFile = (hash) => action(IPFS_CAT_FILE.REQUEST, {hash})
export const ipfsAddFile = (hash) => action(IPFS_ADD_FILE.REQUEST, {hash})
