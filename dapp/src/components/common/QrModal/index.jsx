import React from 'react'
import Modal from 'components/Modal'
import QRCode from 'qrcode.react'

export default ({ value, hideModal }) => {
  return (
    <Modal className='qr-code__wrapper' onClose={hideModal}>
      <div className='qr-code'>
        <h6 className='qr-code__title'>{value}</h6>
        <div className='qr-code__image'>
          <QRCode size={250} value={value} />
        </div>
        <div className='qr-code__text'>
        Please download the <a style={{ textDecoration: 'underline', fontWeight: 'bold', color: '#58aeff' }} target='_blank' href='https://play.google.com/store/apps/details?id=com.creatix.fusewallet&hl=en'>Fuse wallet</a>, register and click on "switch community" and then scan this QR code to add the community you created as the default community on the wallet
        </div>
      </div>
    </Modal>
  )
}
