import React from 'react'
import { connect } from 'react-redux'

import {hideModal} from 'actions/ui'
import LoginModal from 'components/LoginModal'
import ComingSoonModal from 'components/ComingSoonModal'
import ErrorModal from 'components/ErrorModal'
import LoadingModal from 'components/LoadingModal'
import ExchangeModal from 'components/exchange/ExchangeModal'

import { LOGIN_MODAL, SOON_MODAL, ERROR_MODAL, EXCHANGE_MODAL, LOADING_MODAL } from 'constants/uiConstants'

const MODAL_COMPONENTS = {
  [LOGIN_MODAL]: (props) => <LoginModal {...props} />,
  [SOON_MODAL]: (props) => <ComingSoonModal {...props} />,
  [ERROR_MODAL]: (props) => <ErrorModal {...props} />,
  [EXCHANGE_MODAL]: (props) => <ExchangeModal {...props} />,
  [LOADING_MODAL]: (props) => <LoadingModal {...props} />
}

const ModalContainer = (props) => {
  if (!props.modalType) {
    return null
  }

  const SpecificModal = MODAL_COMPONENTS[props.modalType]
  return SpecificModal({...props.modalProps, hideModal: props.hideModal})
}

const mapStateToProps = state => {
  return {
    modalType: state.ui.modalType,
    modalProps: state.ui.modalProps
  }
}

const mapDispatchToProps = {
  hideModal
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalContainer)
