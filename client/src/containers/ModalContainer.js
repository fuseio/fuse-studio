import React from 'react'
import { connect } from 'react-redux'

import LoginModal from 'components/LoginModal'
import ComingSoonModal from 'components/ComingSoonModal'
import ErrorModal from 'components/ErrorModal'
import ExchangeModal from 'components/ExchangeModal'

import { LOGIN_MODAL, SOON_MODAL, ERROR_MODAL, EXCHANGE_MODAL } from 'constants/uiConstants'

const MODAL_COMPONENTS = {
  [LOGIN_MODAL]: <LoginModal />,
  [SOON_MODAL]: <ComingSoonModal />,
  [ERROR_MODAL]: <ErrorModal />,
  [EXCHANGE_MODAL]: <ExchangeModal />
}

const ModalContainer = (props) => {
  if (!props.modalType) {
    return null
  }

  const SpecificModal = MODAL_COMPONENTS[props.modalType]
  return SpecificModal
}

const mapStateToProps = state => {
  return {
    modalType: state.ui.modalType
  }
}

export default connect(mapStateToProps)(ModalContainer)
