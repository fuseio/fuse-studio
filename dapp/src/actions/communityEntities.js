import { action, createEntityAction, createTransactionRequestTypes, createRequestTypes } from './utils'
import { actions } from 'react-table'

export const entityName = 'communityEntities'
export const entityBusinesses = 'businesses'

const entitiesAction = createEntityAction(entityName)
const entitiesBusinessesAction = createEntityAction(entityBusinesses)

export const FETCH_ENTITIES = createRequestTypes('FETCH_ENTITIES')
export const FETCH_USERS_ENTITIES = createRequestTypes('FETCH_USERS_ENTITIES')
export const FETCH_BUSINESSES_ENTITIES = createRequestTypes('FETCH_BUSINESSES_ENTITIES')

export const TOGGLE_COMMUNITY_MODE = createTransactionRequestTypes('TOGGLE_COMMUNITY_MODE')
export const ADD_ENTITY = createTransactionRequestTypes('ADD_ENTITY')
export const REMOVE_ENTITY = createTransactionRequestTypes('REMOVE_ENTITY')
export const EDIT_ENTITY = createTransactionRequestTypes('EDIT_ENTITY')
export const ADD_ADMIN_ROLE = createTransactionRequestTypes('ADD_ADMIN_ROLE')
export const REMOVE_ADMIN_ROLE = createTransactionRequestTypes('REMOVE_ADMIN_ROLE')
export const CONFIRM_USER = createTransactionRequestTypes('CONFIRM_USER')

export const FETCH_ENTITY = createRequestTypes('FETCH_ENTITY')
export const FETCH_ENTITY_METADATA = createRequestTypes('FETCH_ENTITY_METADATA')
export const JOIN_COMMUNITY = createRequestTypes('JOIN_COMMUNITY')
export const IMPORT_EXISTING_ENTITY = createRequestTypes('IMPORT_EXISTING_ENTITY')
export const UPLOAD_IMAGE = createRequestTypes('UPLOAD_IMAGE')

export const FETCH_USER_WALLETS = createRequestTypes('FETCH_USER_WALLETS')
export const FETCH_USERS_METADATA = createRequestTypes('FETCH_USERS_METADATA')
const options = { desiredNetworkType: 'fuse' }

export const fetchEntities = (communityAddress) => entitiesAction(FETCH_ENTITIES.REQUEST, { communityAddress })
export const fetchEntity = (communityAddress, account) => entitiesAction(FETCH_ENTITY.REQUEST, { communityAddress, account })
export const fetchEntityMetadata = (communityAddress, account) => entitiesBusinessesAction(FETCH_ENTITY_METADATA.REQUEST, { communityAddress, account })

export const fetchUsersMetadata = (accounts) => entitiesAction(FETCH_USERS_METADATA.REQUEST, { accounts })

export const addEntity = (communityAddress, data, isClosed, entityType) => action(ADD_ENTITY.REQUEST, { communityAddress, data, isClosed, entityType, options })
export const removeEntity = (account) => action(REMOVE_ENTITY.REQUEST, { account, options })
export const addAdminRole = (account) => action(ADD_ADMIN_ROLE.REQUEST, { account, options })
export const removeAdminRole = (account) => action(REMOVE_ADMIN_ROLE.REQUEST, { account, options })
export const confirmUser = (account) => action(CONFIRM_USER.REQUEST, { account, options })
export const editEntity = (listAddress, hash, data) => action(EDIT_ENTITY.REQUEST, { listAddress, hash, data, options })
export const joinCommunity = (communityAddress, data) => action(JOIN_COMMUNITY.REQUEST, { communityAddress, data, options })
export const importExistingEntity = (accountAddress, communityAddress, isClosed) => action(IMPORT_EXISTING_ENTITY.REQUEST, { accountAddress, communityAddress, isClosed, options })
export const uploadImage = (image) => action(UPLOAD_IMAGE.REQUEST, { image })

export const fetchUserWallets = (accounts) => action(FETCH_USER_WALLETS.REQUEST, { accounts })
export const toggleCommunityMode = (communityAddress, isClosed) => action(TOGGLE_COMMUNITY_MODE.REQUEST, { communityAddress, isClosed })
