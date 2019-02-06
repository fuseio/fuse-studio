import {REQUEST, PENDING, SUCCESS, FAILURE} from 'actions/constants'

export const action = (type, payload = {}) => ({
  type, ...payload
})

export const requestAction = (action, payload = {}) => ({
  type: action.REQUEST, ...payload
})

const requestTypes = [REQUEST, SUCCESS, FAILURE]

export function createRequestTypes (base) {
  return requestTypes.reduce((acc, type) => {
    acc[type] = `${base}_${type}`
    return acc
  }, {})
}

const transactionRequestTypes = [REQUEST, PENDING, SUCCESS, FAILURE]

export function createTransactionRequestTypes (base) {
  return transactionRequestTypes.reduce((acc, type) => {
    acc[type] = `${base}_${type}`
    return acc
  }, {})
}

export const transactionPending = (action, transactionHash, response = {}) => ({
  type: action.PENDING,
  response: {
    ...response,
    transactionStatus: PENDING,
    transactionHash
  }
})

export const transactionFailed = (action, receipt, response = {}) => ({
  type: action.FAILURE,
  response: {
    ...response,
    transactionStatus: FAILURE,
    receipt
  }
})

export const transactionSucceeded = (action, receipt, response = {}) => ({
  type: action.SUCCESS,
  response: {
    ...response,
    transactionStatus: SUCCESS,
    receipt
  }
})

export const createEntityAction = (entity) => (...args) =>
  ({...action.apply(null, args), entity})
