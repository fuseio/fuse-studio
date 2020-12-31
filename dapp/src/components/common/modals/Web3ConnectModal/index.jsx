import React from 'react'
import Modal from 'components/common/Modal'
import MetamaskIcon from 'images/metamask-fox.png'
import TorusIcon from 'images/torus_icon.jpeg'
import EtherIcon from 'images/ether.svg'

export default ({ hideModal, connectTo }) => {
  const createHandleProvider = (provider) => (e) => {
    connectTo(provider)
    hideModal()
  }

  return (
    <Modal onClose={hideModal} hasCloseBtn>
      <div className='wallet-modal'>
        <div className='wallet-modal__title'>Connect your wallet</div>
        <div className='wallet-modal__providers-list'>
          <div className='wallet-modal__provider' onClick={createHandleProvider('torus')}>
            <img className='image' src={TorusIcon} />
            <div className='text'>
              Torus
            </div>
            <div className='info'>Connect using Torus</div>
          </div>
          <div className='wallet-modal__provider' onClick={createHandleProvider('injected')}>
            <img className='image' src={MetamaskIcon} />
            <div className='text'>
              MetaMask
            </div>
            <div className='info'>Connect using metamask</div>
          </div>
        </div>
        <div className='wallet-modal__explanation grid-x grid-margin-x align-middle align-center'>
          <div className='cell shrink'>
            <img src={EtherIcon} />
          </div>
          <div className='cell small-20'>
            <div>A wallet is needed in order to interact with both Ethereum and Fuse.</div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
