import * as ui from 'actions/ui'

export default (state = {
  modalType: null
}, action) => {
  switch (action.type) {
    case ui.SHOW_MODAL:
      return { ...state, modalType: action.modalType, modalProps: action.modalProps }
    case ui.HIDE_MODAL:
      return { ...state, modalType: null, modalProps: null }
    case ui.SET_MODAL_PROPS:
      return { ...state, modalProps: action.modalProps }
    case ui.UPDATE_MODAL_PROPS:
      return { ...state, modalProps: { ...state.modalProps, ...action.modalProps } }
    default:
      return state
  }
}
