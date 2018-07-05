import * as ui from 'actions/ui'
const panByHorizontalOffset = 1.4 

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
    case 'SHOW_MODAL':
    	return {...state, modalType: action.modalType}
    case 'HIDE_MODAL':
    	return {...state, modalType: null}
    case 'SIGNUP_HIDE':
      return {...state, signupHide: action.hide}
    case 'SIGNUP_CLOSE':
      return {...state, signupClose: action.close}
    case 'BUY_STAGE':
      return {...state, buyStage: action.stage}
    case 'BUY_SELL_AMOUNTS':
      return { ...state, isBuy: action.isBuy, ccAddress: action.ccAddress, cln: action.cln,  cc: action.cc, minimum: action.minimum }
    default:
      return state
  }
}