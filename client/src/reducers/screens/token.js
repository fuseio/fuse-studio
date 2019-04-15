import { TRANSFER_TOKEN, MINT_TOKEN, BURN_TOKEN } from 'actions/token'

export default (state = {}, action) => {
  switch (action.type) {
    case TRANSFER_TOKEN.REQUEST:
      return { ...state, signatureNeeded: true }
    case TRANSFER_TOKEN.CONFIRMATION:
      return { ...state, ...action.response }
    case TRANSFER_TOKEN.PENDING:
      return { ...state, signatureNeeded: false, transactionHash: action.response.transactionHash, isTransfer: true }
    case TRANSFER_TOKEN.SUCCESS:
      return { ...state, ...action.response, signatureNeeded: false, isTransfer: false }
    case TRANSFER_TOKEN.FAILURE:
      return {...state, ...action.response}
    case MINT_TOKEN.REQUEST:
      return { ...state, signatureNeeded: true }
    case MINT_TOKEN.CONFIRMATION:
      return { ...state, ...action.response }
    case MINT_TOKEN.PENDING:
      return { ...state, signatureNeeded: false, transactionHash: action.response.transactionHash, isMinting: true }
    case MINT_TOKEN.SUCCESS:
      return { ...state, ...action.response, isMinting: false }
    case MINT_TOKEN.FAILURE:
      return {...state, ...action.response}
    case BURN_TOKEN.REQUEST:
      return { ...state, signatureNeeded: true }
    case BURN_TOKEN.CONFIRMATION:
      return { ...state, ...action.response }
    case BURN_TOKEN.PENDING:
      return { ...state, signatureNeeded: false, transactionHash: action.response.transactionHash, isBurning: true }
    case BURN_TOKEN.SUCCESS:
      return { ...state, ...action.response, isBurning: false }
    case BURN_TOKEN.FAILURE:
      return {...state, ...action.response}
    default:
      return state
  }
}
