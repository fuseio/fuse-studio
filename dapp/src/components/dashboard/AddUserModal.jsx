import React, { PureComponent } from 'react'
import Modal from 'components/Modal'
import AddUserForm from './AddUserForm'

export default class AddUserModal extends PureComponent {
  handleSubmitUser = (...args) => {
    const { submitEntity, hideModal } = this.props
    submitEntity(...args)
    hideModal()
  }

  render () {
    const { hideModal } = this.props
    return (
      <Modal className='user-form__modal' onClose={hideModal}>
        <div className='user-form__wrapper' onClose={hideModal}>
          <div className='user-form__image'>
            <div />
          </div>
          <AddUserForm submitEntity={this.handleSubmitUser} />
        </div>
      </Modal>
    )
  }
}
