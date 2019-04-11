import {PENDING, SUCCESS, FAILURE} from 'actions/constants'

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

export const transactionConfirmed = (action, receipt, confirmationNumber, response = {}) => ({
  type: action.CONFIRMATION,
  response: {
    ...response,
    transactionStatus: SUCCESS,
    confirmationNumber,
    receipt
  }
})
