import React from 'react'
import { connect } from 'react-redux'

import LoginModal from 'components/LoginModal'
import ComingSoonModal from 'components/ComingSoonModal'

import { LOGIN_MODAL, SOON_MODAL } from 'constants/uiConstants'

const MODAL_COMPONENTS = {
  LOGIN_MODAL: <LoginModal />,
  SOON_MODAL: <ComingSoonModal />
};

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
