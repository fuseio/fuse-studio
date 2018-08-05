import * as ui from 'actions/ui'

export default (state = {
  activeMarker: null,
  modalType: null,
  signupHide: false
}, action) => {
  switch (action.type) {
    case 'ACTIVE_MARKER':
      return {...state, activeMarker: action.coinAddress}
    case 'ZOOM':
      return {...state, zoom: action.zoom}
    case ui.SHOW_MODAL:
      return {...state, modalType: action.modalType, modalProps: action.modalProps}
    case ui.HIDE_MODAL:
      return {...state, modalType: null, modalProps: null}
    case ui.SET_MODAL_PROPS:
      return {...state, modalProps: action.modalProps}
    case ui.UPDATE_MODAL_PROPS:
      return {...state, modalProps: {...state.modalProps, buyStage: action.buyStage}}
    case ui.SIGNUP_HIDE:
      return {...state, signupHide: action.hide}
    case ui.SIGNUP_CLOSE:
      return {...state, signupClose: action.close}
    case ui.RESET_EXCHANGE:
      return {...state, modalProps: {buyStage: 1}}
    default:
      return state
  }
}
