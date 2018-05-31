import * as ui from 'actions/ui'
const panByHorizontalOffset = 1.4 

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
    case 'SHOW_MODAL':
    	return {...state, modalType: action.modalType}
    case 'HIDE_MODAL':
    	return {...state, modalType: null}
    case 'SIGNUP_HIDE':
      return {...state, signupHide: action.hide}
    case 'SIGNUP_CLOSE':
      return {...state, signupClose: action.close}
    default:
      return state
  }
}