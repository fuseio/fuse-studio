import React from 'react'
import QRCode from 'qrcode.react'
import AppleDownload from 'images/apple.svg'
import GoogleDownload from 'images/google.svg'
import { isMobile } from 'react-device-detect'

export default ({ value }) => {
  if (!value) return null

  return (
    <div className='qr-code__wrapper'>
      <h2 className='qr-code__title'>White label wallet</h2>
      <div className='qr-code'>
        <div className='qr-code__image'>
          <QRCode size={!isMobile ? 250 : 150} value={value} />
        </div>
        <div className='qr-code__text'>
          Please download the Fuse wallet, register and click on "switch community" and then scan this QR code to add the community you created as the default community on the wallet
        </div>
        <div className='qr-code__download grid-x align-middle align align-justify'>
          <a href='https://testflight.apple.com/join/CQKLoJje' target='_blank'><img src={AppleDownload} /></a>
          <a href='https://play.google.com/store/apps/details?id=com.creatix.fusewallet&hl=en' target='_blank'><img src={GoogleDownload} /></a>
        </div>
      </div>
    </div>
  )
}
