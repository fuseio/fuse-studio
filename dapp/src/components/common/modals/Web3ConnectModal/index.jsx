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
    <Modal onClose={hideModal} hasCloseBtn>
      <div className='wallet-modal'>
        <div className='wallet-modal__title'>Choose your Ethereum wallet to get started:</div>
        <div className='wallet-modal__providers-list'>
          <div className='wallet-modal__provider grid-y align-middle' onClick={createHandleProvider('injected')}>
            <img src={MetamaskIcon} />
            MetaMask
          </div>
          <div className='wallet-modal__provider grid-y align-middle' onClick={createHandleProvider('torus')}>
            <img src={GoogleIcon} />
            Torus
          </div>
        </div>
        <div className='wallet-modal__explanation grid-x align-middle'>
          <div>
            <img src={EtherIcon} />
          </div>
          <div style={{ marginLeft: '1em' }}>
            The Studio deploys communities on Ethereum mainnet by default <br />
            (You can test also test in Testnet to avoid feed - <a target='_blank' href='https://docs.fuse.io/the-fuse-studio/getting-started/using-the-studio-for-free-on-ropsten'>Learn here how</a>)
          </div>
        </div>
      </div>
    </Modal>)
}
