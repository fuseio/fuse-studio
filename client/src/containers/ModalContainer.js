import React from 'react'
import { connect } from 'react-redux'

import LoginModal from 'components/LoginModal'
import ComingSoonModal from 'components/ComingSoonModal'
import ErrorModal from 'components/ErrorModal'
import ExchangeModal from 'components/exchange/ExchangeModal'

import { LOGIN_MODAL, SOON_MODAL, ERROR_MODAL, EXCHANGE_MODAL } from 'constants/uiConstants'

const MODAL_COMPONENTS = {
  [LOGIN_MODAL]: (props) => <LoginModal {...props} />,
  [SOON_MODAL]: (props) => <ComingSoonModal {...props} />,
  [ERROR_MODAL]: (props) => <ErrorModal {...props} />,
  [EXCHANGE_MODAL]: (props) => <ExchangeModal {...props} />
}

const ModalContainer = (props) => {
  if (!props.modalType) {
    return null
  }

  const SpecificModal = MODAL_COMPONENTS[props.modalType]
  return SpecificModal(props.modalProps)
}

const mapStateToProps = state => {
  return {
    modalType: state.ui.modalType,
    modalProps: state.ui.modalProps
  }
}

export default connect(mapStateToProps)(ModalContainer)
