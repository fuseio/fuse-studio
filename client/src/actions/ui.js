import {action} from './utils'

export const setActiveMarker = (coinAddress) => action('ACTIVE_MARKER', {coinAddress})
export const zoomToMarker = (zoom) => action('ZOOM', { zoom })

export const SHOW_MODAL = 'SHOW_MODAL'
export const HIDE_MODAL = 'HIDE_MODAL'
export const SIGNUP_HIDE = 'SIGNUP_HIDE'
export const SIGNUP_CLOSE = 'SIGNUP_CLOSE'
export const BUY_STAGE = 'BUY_STAGE'
export const BUY_SELL_AMOUNTS = 'BUY_SELL_AMOUNTS'
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

export const setBuySellAmounts = (obj) => {
  return {
    type: BUY_SELL_AMOUNTS,
    payload: obj
  }
}

export const resetExchange = () => {
  return {
    type: RESET_EXCHANGE
  }
}
