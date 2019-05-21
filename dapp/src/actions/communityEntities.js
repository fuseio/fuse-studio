import { action, createEntityAction, createTransactionRequestTypes, createRequestTypes } from './utils'

export const entityName = 'communityEntities'

const entitiesAction = createEntityAction(entityName)

export const FETCH_COMMUNITY = createRequestTypes('GET_COMMUNITY')
export const FETCH_ENTITIES = createRequestTypes('FETCH_ENTITIES')
export const FETCH_USERS_ENTITIES = createRequestTypes('FETCH_USERS_ENTITIES')
export const FETCH_BUSINESSES_ENTITIES = createRequestTypes('FETCH_BUSINESSES_ENTITIES')

export const TOGGLE_COMMNITY_MODE = createTransactionRequestTypes('TOGGLE_COMMNITY_MODE')
export const ADD_ENTITY = createTransactionRequestTypes('ADD_ENTITY')
export const REMOVE_ENTITY = createTransactionRequestTypes('REMOVE_ENTITY')
export const EDIT_ENTITY = createTransactionRequestTypes('EDIT_ENTITY')
export const ADD_ADMIN_ROLE = createTransactionRequestTypes('ADD_ADMIN_ROLE')
export const REMOVE_ADMIN_ROLE = createTransactionRequestTypes('REMOVE_ADMIN_ROLE')
export const CONFIRM_USER = createTransactionRequestTypes('CONFIRM_USER')

export const FETCH_ENTITY = createRequestTypes('FETCH_ENTITY')

export const fetchCommunity = (tokenAddress) => action(FETCH_COMMUNITY.REQUEST, { tokenAddress })

export const fetchUsersEntities = (communityAddress, entityType = 'user') => entitiesAction(FETCH_USERS_ENTITIES.REQUEST, { communityAddress, entityType })
export const fetchBusinessesEntities = (communityAddress, entityType = 'business') => entitiesAction(FETCH_BUSINESSES_ENTITIES.REQUEST, { communityAddress, entityType })

export const fetchEntity = (account) => entitiesAction(FETCH_ENTITY.REQUEST, { account })

export const addEntity = (communityAddress, data, isClosed) => action(ADD_ENTITY.REQUEST, { communityAddress, data, isClosed })
export const removeEntity = (communityAddress, account) => action(REMOVE_ENTITY.REQUEST, { communityAddress, account })
export const addAdminRole = (account) => action(ADD_ADMIN_ROLE.REQUEST, { account })
export const removeAdminRole = (account) => action(REMOVE_ADMIN_ROLE.REQUEST, { account })
export const confirmUser = (account) => action(CONFIRM_USER.REQUEST, { account })
export const editEntity = (listAddress, hash, data) => action(EDIT_ENTITY.REQUEST, { listAddress, hash, data })

export const toggleCommunityMode = (communityAddress, isClosed) => action(TOGGLE_COMMNITY_MODE.REQUEST, { communityAddress, isClosed })
