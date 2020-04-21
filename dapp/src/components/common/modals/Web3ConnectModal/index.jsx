import React from 'react'
import Modal from 'components/common/Modal'
import MetamaskIcon from 'images/metamask-fox.svg'
import GoogleIcon from 'images/google.svg'
import EtherIcon from 'images/ether.svg'

export default ({ hideModal, web3connect }) => {
  const createHandleProvider = (provider) => (e) => {
    web3connect.core.connectTo(provider)
    hideModal()
  }

  return (
    <Modal onClose={hideModal}>
      <div className='wallet-modal'>
        <div className='wallet-modal__title'>Choose your Ethereum wallet to get started:</div>
        <div className='wallet-modal__providers-list'>
          <div className='wallet-modal__provider' onClick={createHandleProvider('injected')}>
            <img src={MetamaskIcon} />
            MetaMask
          </div>
          <div className='wallet-modal__provider' onClick={createHandleProvider('torus')}>
            <img src={GoogleIcon} />
            Torus
          </div>
        </div>
        <div className='wallet-modal__explanation'>
          <div>
            <img src={EtherIcon} />
          </div>
          <div>
            The Studio deploys communities on Ethereum mainnet by default <br />
            (You can test also test in Testnet to avoid feed - <a target='_blank' href='https://docs.fuse.io/the-fuse-studio/how-to-add-fuse-to-your-metamask'>Learn here how</a>)
          </div>
        </div>
      </div>
    </Modal>)
}
