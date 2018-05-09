import {action} from './utils'

export const setActiveMarker = (coinAddress) => action('ACTIVE_MARKER', {coinAddress})
//export const closeCommunitySidebar = () => action('CLOSE_COMMUNITY_SIDEBAR', { zoom: 4 })
export const zoomToMarker = (zoom) => action('ZOOM', { zoom })
