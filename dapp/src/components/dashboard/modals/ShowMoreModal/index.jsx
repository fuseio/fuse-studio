import React from 'react'
import Modal from 'components/common/Modal'
import CopyToClipboard from 'components/common/CopyToClipboard'
import FontAwesome from 'react-fontawesome'
import { addressShortener } from 'utils/format'

export default ({ hideModal, name, tokenName, foreignTokenAddress, homeTokenAddress, homeBridgeAddress, foreignBridgeAddress }) => {
  return (
    <Modal className='show-more__wrapper' onClose={hideModal} hasCloseBtn>
      <div className='show-more'>
        <div className='show-more__header'>{name}</div>
        <div className='show-more__content'>
          <div className='show-more__content__item'>
            <span>Token name</span>
            <span>{tokenName}</span>
          </div>
          {
            foreignTokenAddress && <div className='show-more__content__item'>
              <span>Token foreign address</span>
              <span className='address'>
                {addressShortener(foreignTokenAddress)}
                <CopyToClipboard text={foreignTokenAddress}>
                  <FontAwesome name='clone' />
                </CopyToClipboard>
              </span>
            </div>
          }
          {
            homeTokenAddress && <div className='show-more__content__item'>
              <span>Token home address</span>
              <span className='address'>
                {addressShortener(homeTokenAddress)}
                <CopyToClipboard text={homeTokenAddress}>
                  <FontAwesome name='clone' />
                </CopyToClipboard>
              </span>
            </div>
          }
          {
            foreignBridgeAddress && <div className='show-more__content__item'>
              <span>Bridge foreign address</span>
              <span className='address'>
                {addressShortener(foreignBridgeAddress)}
                <CopyToClipboard text={foreignBridgeAddress}>
                  <FontAwesome name='clone' />
                </CopyToClipboard>
              </span>
            </div>
          }
          {
            homeBridgeAddress && <div className='show-more__content__item'>
              <span>Bridge home address</span>
              <span className='address'>
                {addressShortener(homeBridgeAddress)}
                <CopyToClipboard text={homeBridgeAddress}>
                  <FontAwesome name='clone' />
                </CopyToClipboard>
              </span>
            </div>
          }
        </div>
      </div>
    </Modal>
  )
}
