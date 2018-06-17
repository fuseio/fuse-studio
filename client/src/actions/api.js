import {action, createRequestTypes} from './utils'

export const FETCH_METADATA = createRequestTypes('FETCH_METADATA')

export const fetchMetadata = ({hash, protocol}) => action(FETCH_METADATA.REQUEST, {hash, protocol})
