import * as ui from 'actions/ui'

export default (state = {
  activeMarker: null,
  modalType: null,
  signupHide: false,
  buyStage: 1
}, action) => {
  switch (action.type) {
    case 'ACTIVE_MARKER':
      return {...state, activeMarker: action.coinAddress}
    case 'ZOOM':
      return {...state, zoom: action.zoom}
    case ui.SHOW_MODAL:
      return {...state, modalType: action.modalType, modalProps: action.modalProps}
    case ui.HIDE_MODAL:
      return {...state, modalType: null}
    case ui.SIGNUP_HIDE:
      return {...state, signupHide: action.hide}
    case ui.SIGNUP_CLOSE:
      return {...state, signupClose: action.close}
    case ui.BUY_STAGE:
      return {...state, buyStage: action.stage}
    case ui.BUY_SELL_AMOUNTS:
      return { ...state, isBuy: action.isBuy, ccAddress: action.ccAddress, cln: action.cln, cc: action.cc, minimum: action.minimum, priceChange: action.priceChange, priceLimit: action.priceLimit }
    case ui.RESET_EXCHANGE:
      return {...state, isBuy: null, ccAddress: null, cln: null, cc: null, minimum: null, priceChange: null, priceLimit: null, buyStage: 1}
    default:
      return state
  }
}
