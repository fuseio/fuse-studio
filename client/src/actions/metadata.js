import {action, createRequestTypes} from './utils'

export const entityName = 'metadata'

export const FETCH_METADATA = createRequestTypes('FETCH_METADATA')
export const CREATE_METADATA = createRequestTypes('CREATE_METADATA')

export const fetchMetadata = (tokenURI) => action(FETCH_METADATA.REQUEST, {tokenURI})
export const createMetadata = (metadata) => action(CREATE_METADATA.REQUEST, {metadata})
