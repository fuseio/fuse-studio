import * as ui from 'actions/ui'

export default (state = {
	activeMarker: null
}, action) => {
  switch (action.type) {
    case 'ACTIVE_MARKER':
      return {...state, activeMarker: action.coinAddress}
    
    case 'ZOOM':
    	return {...state, zoom: action.zoom}
    default:
      return state
  }
}
