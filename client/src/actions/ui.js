import {action} from './utils'

export const setActiveMarker = (coinAddress) => action('ACTIVE_MARKER', {coinAddress})
export const zoomToMarker = (zoom) => action('ZOOM', { zoom })

export const SHOW_MODAL = 'SHOW_MODAL'
export const HIDE_MODAL = 'HIDE_MODAL'
export const SET_MODAL_PROPS = 'SET_MODAL_PROPS'
export const UPDATE_MODAL_PROPS = 'UPDATE_MODAL_PROPS'

export const SIGNUP_HIDE = 'SIGNUP_HIDE'
export const SIGNUP_CLOSE = 'SIGNUP_CLOSE'
export const BUY_STAGE = 'BUY_STAGE'
export const RESET_EXCHANGE = 'RESET_EXCHANGE'

export const loadModal = (modalType, modalProps) => {
  return {
    type: SHOW_MODAL,
    modalType,
    modalProps
  }
}

export const hideModal = () => {
  return {
    type: HIDE_MODAL
  }
}

export const setModalProps = (modalProps) => {
  return {
    type: SET_MODAL_PROPS,
    modalProps
  }
}

export const updateModalProps = (modalProps) => {
  return {
    type: UPDATE_MODAL_PROPS,
    modalProps
  }
}

export const hideSignup = (hide) => {
  return {
    type: SIGNUP_HIDE,
    hide
  }
}

export const closeSignup = (close) => {
  return {
    type: SIGNUP_CLOSE,
    close
  }
}

export const setBuyStage = (buyStage) => {
  return {
    type: BUY_STAGE,
    buyStage
  }
}

export const resetExchange = () => {
  return {
    type: RESET_EXCHANGE
  }
}
