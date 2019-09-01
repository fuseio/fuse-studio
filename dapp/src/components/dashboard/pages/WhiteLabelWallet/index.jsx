import React, { Fragment } from 'react'
import QRCode from 'qrcode.react'
import AppleDownload from 'images/apple.svg'
import GoogleDownload from 'images/google.svg'
import { isMobile } from 'react-device-detect'

export default ({ value }) => {
  if (!value) return null

  return (
    <Fragment>
      <div className='qr-code__header'><h2 className='qr-code__header__title'>White label wallet</h2></div>
      <div className='qr-code__wrapper'>
        <div className='qr-code'>
          <div className='qr-code__image'>
            <QRCode size={!isMobile ? 250 : 150} value={value} />
          </div>
          <div className='qr-code__text'>
            Please download the Fuse wallet, register and click on "switch community" and then scan this QR code to add the community you created as the default community on the wallet
          </div>
          <div className='qr-code__download grid-x align-middle align align-justify'>
            <a href='https://testflight.apple.com/join/02P1laVr' target='_blank'><img src={AppleDownload} /></a>
            <a href='https://play.google.com/store/apps/details?id=io.fusenet.fusewallet' target='_blank'><img src={GoogleDownload} /></a>
          </div>
        </div>
      </div>
    </Fragment>
  )
}
