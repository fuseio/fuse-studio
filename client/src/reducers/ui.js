import * as ui from 'actions/ui'
import {quoteActions, CHANGE} from 'actions/marketMaker'
import {filterSuccessActions, filterRequestActions} from 'utils/actions'

const relevantQuoteActions = {...filterRequestActions(quoteActions),
  ...filterSuccessActions(quoteActions)}
relevantQuoteActions[CHANGE.PENDING] = CHANGE

export default (state = {
  modalType: null
}, action) => {
  if (relevantQuoteActions.hasOwnProperty(action.type)) {
    return {...state, modalProps: {...state.modalProps, ...action.response}}
  }
  switch (action.type) {
    case ui.SHOW_MODAL:
      return {...state, modalType: action.modalType, modalProps: action.modalProps}
    case ui.HIDE_MODAL:
      return {...state, modalType: null, modalProps: null}
    case ui.SET_MODAL_PROPS:
      return {...state, modalProps: action.modalProps}
    case ui.UPDATE_MODAL_PROPS:
      return {...state, modalProps: {...state.modalProps, ...action.modalProps}}
    default:
      return state
  }
}
