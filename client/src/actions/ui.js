import {action} from './utils'

export const setActiveMarker = (coinAddress) => action('ACTIVE_MARKER', {coinAddress, location})
//export const closeCommunitySidebar = () => action('CLOSE_COMMUNITY_SIDEBAR', { zoom: 4 })
export const zoomToMarker = (zoom) => action('ZOOM', { zoom })

export const loadModal = (modalType) => {
  return {
    type: 'SHOW_MODAL',
    modalType
  }
}

export const hideModal = () => {
  return {
    type: 'HIDE_MODAL'
  }
}

export const hideSignup = (hide) => {
  return {
    type: 'SIGNUP_HIDE',
    hide
  }
}

export const closeSignup = (close) => {
  return {
    type: 'SIGNUP_CLOSE',
    close
  }
}

export const setBuyStage = (stage) => {
  return {
    type: 'BUY_STAGE',
    stage
  }
}