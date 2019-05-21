import React from 'react'
import Modal from 'components/Modal'
import CopyToClipboard from 'components/common/CopyToClipboard'
import FontAwesome from 'react-fontawesome'

const formatAddress = (address) => {
  return (address && `${address.substring(0, 6)}...${address.substr(address.length - 4)}`) || ''
}

export default ({ hideModal, name, network, tokenName, tokenAmount, foreignTokenAddress, homeTokenAddress, homeBridgeAddress, foreignBridgeAddress }) => {
  return (
    <Modal className='show-more__wrapper' onClose={hideModal}>
      <div className='show-more'>
        <div className='show-more__header'>{name}</div>
        <div className='show-more__content'>
          {
            name && name.toLowerCase() === 'fuse' && <div className='show-more__content__item'>
              <span>RPC Network</span>
              <span>{network}</span>
            </div>
          }
          <div className='show-more__content__item'>
            <span>Token name</span>
            <span>{tokenName}</span>
          </div>
          <div className='show-more__content__item'>
            <span>Token foreign address</span>
            <span className='address'>
              {formatAddress(foreignTokenAddress)}
              <CopyToClipboard text={foreignTokenAddress}>
                <FontAwesome name='clone' />
              </CopyToClipboard>
            </span>
          </div>
          <div className='show-more__content__item'>
            <span>Token home address</span>
            <span className='address'>
              {formatAddress(homeTokenAddress)}
              <CopyToClipboard text={homeTokenAddress}>
                <FontAwesome name='clone' />
              </CopyToClipboard>
            </span>
          </div>
          <div className='show-more__content__item'>
            <span>Bridge foreign address</span>
            <span className='address'>
              {formatAddress(foreignBridgeAddress)}
              <CopyToClipboard text={foreignBridgeAddress}>
                <FontAwesome name='clone' />
              </CopyToClipboard>
            </span>
          </div>
          <div className='show-more__content__item'>
            <span>Bridge home address</span>
            <span className='address'>
              {formatAddress(homeBridgeAddress)}
              <CopyToClipboard text={homeBridgeAddress}>
                <FontAwesome name='clone' />
              </CopyToClipboard>
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )
}
