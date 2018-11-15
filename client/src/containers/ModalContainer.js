import React from 'react'
import { connect } from 'react-redux'

import {hideModal} from 'actions/ui'
import LoginModal from 'components/LoginModal'
import ComingSoonModal from 'components/ComingSoonModal'
import WrongNetworkModal from 'components/WrongNetworkModal'
import LoadingModal from 'components/LoadingModal'
import PriceExplanationModal from 'components/PriceExplanationModal'
import ExchangeModal from 'components/exchange/ExchangeModal'
import ErrorBoundary from 'components/ErrorBoundary'
import MetamaskModal from 'components/issuance/MetamaskModal'
import SimpleExchangeModal from 'components/oven/SimpleExchangeModal'
import CalculatorModal from 'components/CalculatorModal'

import {
  LOGIN_MODAL,
  SOON_MODAL,
  WRONG_NETWORK_MODAL,
  EXCHANGE_MODAL,
  LOADING_MODAL,
  PRICE_EXPLANATION_MODAL,
  METAMASK_ACCOUNT_MODAL,
  SIMPLE_EXCHANGE_MODAL,
  CALCULATOR_MODAL
} from 'constants/uiConstants'

const renderModal = (modalComponent, props) =>
  <ErrorBoundary hideModal={props.hideModal}>
    {React.createElement(modalComponent, props)}
  </ErrorBoundary>

const MODAL_COMPONENTS = {
  [LOGIN_MODAL]: (props) => renderModal(LoginModal, props),
  [SOON_MODAL]: (props) => renderModal(ComingSoonModal, props),
  [EXCHANGE_MODAL]: (props) => renderModal(ExchangeModal, props),
  [WRONG_NETWORK_MODAL]: (props) => renderModal(WrongNetworkModal, props),
  [LOADING_MODAL]: (props) => renderModal(LoadingModal, props),
  [PRICE_EXPLANATION_MODAL]: (props) => renderModal(PriceExplanationModal, props),
  [METAMASK_ACCOUNT_MODAL]: (props) => renderModal(MetamaskModal, props),
  [SIMPLE_EXCHANGE_MODAL]: (props) => renderModal(SimpleExchangeModal, props),
  [CALCULATOR_MODAL]: (props) => renderModal(CalculatorModal, props)
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
