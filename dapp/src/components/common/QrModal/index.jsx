import React from 'react'
import Modal from 'components/common/Modal'
import QRCode from 'qrcode.react'

export default ({ value, hideModal }) => {
  return (
    <Modal className='qr_code_modal__wrapper' onClose={hideModal}>
      <div className='qr_code_modal'>
        <h6 className='qr_code_modal__title'>{value}</h6>
        <div className='qr_code_modal__image'>
          <QRCode size={250} value={value} />
        </div>
      </div>
    </Modal>
  )
}
