import {action, createRequestTypes} from './utils'

export const FETCH_METADATA = createRequestTypes('FETCH_METADATA')
export const CREATE_METADATA = createRequestTypes('CREATE_METADATA')

export const fetchMetadata = (protocol, hash, tokenAddress) => action(FETCH_METADATA.REQUEST, {protocol, hash, tokenAddress})
export const createMetadata = (metadata) => action(CREATE_METADATA.REQUEST, {metadata})
