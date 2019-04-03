import {action, createEntityAction, createTransactionRequestTypes, createRequestTypes} from './utils'

export const entityName = 'directoryEntities'

const businessesAction = createEntityAction('businesses')

export const CREATE_LIST = createTransactionRequestTypes('CREATE_LIST')
export const GET_LIST = createTransactionRequestTypes('GET_LIST')

export const ADD_ENTITY = createTransactionRequestTypes('ADD_ENTITY')
export const REMOVE_ENTITY = createTransactionRequestTypes('REMOVE_ENTITY')
export const EDIT_ENTITY = createTransactionRequestTypes('EDIT_ENTITY')

export const ACTIVATE_BUSINESS = createTransactionRequestTypes('ACTIVATE_BUSINESS')
export const DEACTIVATE_BUSINESS = createTransactionRequestTypes('DEACTIVATE_BUSINESS')

export const FETCH_BUSINESSES = createRequestTypes('FETCH_BUSINESSES')
export const FETCH_BUSINESS = createRequestTypes('FETCH_BUSINESS')

export const createList = (tokenAddress) => action(CREATE_LIST.REQUEST, {tokenAddress})
export const getList = (tokenAddress) => action(GET_LIST.REQUEST, {tokenAddress})

export const fetchBusinesses = (listAddress, page) => businessesAction(FETCH_BUSINESSES.REQUEST, {listAddress, page})
export const fetchBusiness = (listAddress, hash) => businessesAction(FETCH_BUSINESS.REQUEST, {listAddress, hash})

export const addEntity = (listAddress, data) => action(ADD_ENTITY.REQUEST, {listAddress, data})
export const removeEntity = (listAddress, hash) => action(REMOVE_ENTITY.REQUEST, {listAddress, hash})
export const editEntity = (listAddress, hash, data) => action(EDIT_ENTITY.REQUEST, {listAddress, hash, data})

export const activateBusiness = (listAddress, hash) => action(ACTIVATE_BUSINESS.REQUEST, {listAddress, hash})
export const deactivateBusiness = (listAddress, hash) => action(DEACTIVATE_BUSINESS.REQUEST, {listAddress, hash})
