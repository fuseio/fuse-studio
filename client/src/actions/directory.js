import {action, createTransactionRequestTypes} from './utils'

export const entityName = 'directoryEntities'

export const CREATE_LIST = createTransactionRequestTypes('CREATE_LIST')
export const GET_LIST = createTransactionRequestTypes('GET_LIST')

export const FETCH_ENTITIES = createTransactionRequestTypes('FETCH_ENTITIES')
export const ADD_ENTITY = createTransactionRequestTypes('ADD_ENTITY')
export const REMOVE_ENTITY = createTransactionRequestTypes('REMOVE_ENTITY')

export const createList = (tokenAddress) => action(CREATE_LIST.REQUEST, {tokenAddress})
export const getList = (tokenAddress) => action(GET_LIST.REQUEST, {tokenAddress})

export const fetchEntities = (listAddress, page) => action(FETCH_ENTITIES.REQUEST, {listAddress, page})
export const addEntity = (listAddress, data) => action(ADD_ENTITY.REQUEST, {listAddress, data})
export const removeEntity = (listAddress, hash) => action(REMOVE_ENTITY.REQUEST, {listAddress, hash})
