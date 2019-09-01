import React from 'react'
import { connect } from 'react-redux'

import { hideModal } from 'actions/ui'
import LoginModal from 'components/common/LoginModal'
import ImageCropperModal from 'components/common/ImageCropper'
import WrongNetworkModal from 'components/common/WrongNetworkModal'
import LoadingModal from 'components/common/LoadingModal'
import ErrorBoundary from 'components/common/ErrorBoundary'
import UserDatatModal from 'components/issuance/UserDatatModal.jsx'
import QrModal from 'components/common/QrModal'
import AddBusinessModal from 'components/dashboard/modals/AddBusinessModal'
import AddUserModal from 'components/dashboard/modals/AddUserModal'
import EntityAddedModal from 'components/dashboard/modals/EntityAddedModal'
import BusinessListModal from 'components/dashboard/modals/BusinessListModal'
import BridgeModal from 'components/dashboard/modals/BridgeModal'
import NoDataAboutOwnerModal from 'components/dashboard/modals/NoDataAboutOwnerModal'
import ShowMoreModal from 'components/dashboard/modals/ShowMoreModal'
import ImportExistingEntity from 'components/dashboard/modals/ImportExistingEntity'
import PluginInfoModal from 'components/dashboard/modals/PluginInfoModal'

import {
  LOGIN_MODAL,
  WRONG_NETWORK_MODAL,
  LOADING_MODAL,
  USER_DATA_MODAL,
  ADD_BUSINESS_MODAL,
  BUSINESS_LIST_MODAL,
  BRIDGE_MODAL,
  NO_DATA_ABOUT_OWNER_MODAL,
  SHOW_MORE_MODAL,
  QR_MODAL,
  ADD_USER_MODAL,
  IMPORT_EXISTING_ENTITY,
  ENTITY_ADDED_MODAL,
  IMAGE_CROPPER_MODAL,
  PLUGIN_INFO_MODAL
} from 'constants/uiConstants'

const renderModal = (modalComponent, props) =>
  <ErrorBoundary hideModal={props.hideModal}>
    {React.createElement(modalComponent, props)}
  </ErrorBoundary>

const MODAL_COMPONENTS = {
  [LOGIN_MODAL]: LoginModal,
  [WRONG_NETWORK_MODAL]: WrongNetworkModal,
  [LOADING_MODAL]: LoadingModal,
  [USER_DATA_MODAL]: UserDatatModal,
  [ADD_BUSINESS_MODAL]: AddBusinessModal,
  [BUSINESS_LIST_MODAL]: BusinessListModal,
  [BRIDGE_MODAL]: BridgeModal,
  [NO_DATA_ABOUT_OWNER_MODAL]: NoDataAboutOwnerModal,
  [SHOW_MORE_MODAL]: ShowMoreModal,
  [QR_MODAL]: QrModal,
  [ADD_USER_MODAL]: AddUserModal,
  [IMPORT_EXISTING_ENTITY]: ImportExistingEntity,
  [ENTITY_ADDED_MODAL]: EntityAddedModal,
  [IMAGE_CROPPER_MODAL]: ImageCropperModal,
  [PLUGIN_INFO_MODAL]: PluginInfoModal
}

const ModalContainer = (props) => {
  if (!props.modalType) {
    return null
  }

  const ModalType = MODAL_COMPONENTS[props.modalType]
  return renderModal(ModalType, { ...props.modalProps, hideModal: props.hideModal })
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
