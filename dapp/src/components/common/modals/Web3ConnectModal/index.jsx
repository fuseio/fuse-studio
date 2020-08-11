import React from 'react'
import Modal from 'components/common/Modal'
import MetamaskIcon from 'images/metamask-fox.png'
import GoogleIcon from 'images/google.png'
import FortmaticIcon from 'images/fortmatic.png'
import EtherIcon from 'images/ether.svg'

export default ({ hideModal, web3connect }) => {
  const createHandleProvider = (provider) => (e) => {
    web3connect.core.connectTo(provider)
    hideModal()
  }

  return (
    <Modal onClose={hideModal} hasCloseBtn>
      <div className='wallet-modal'>
        <div className='wallet-modal__title'>Connect your wallet</div>
        <div className='wallet-modal__providers-list'>
          <div className='wallet-modal__provider' onClick={createHandleProvider('injected')}>
            <img className='image' src={MetamaskIcon} />
            <div className='text'>
              MetaMask
            </div>
            <div className='info'>
              Have Metamask?<br />
              <span>Click here to connect</span>
            </div>
          </div>

          <div className='wallet-modal__provider' onClick={createHandleProvider('fortmatic')}>
            <img className='image' src={FortmaticIcon} />
            <div className='text'>
              Fortmatic
            </div>
            <div className='info'>
              Have Fortmatic?<br />
              <span>Click here to connect</span>
            </div>
          </div>

          <div className='wallet-modal__provider' onClick={createHandleProvider('torus')}>
            <img className='image' src={GoogleIcon} />
            <div className='text'>
              Google
            </div>
            <div className='info'>Create a wallet using your<br /> Google account</div>
          </div>

        </div>
        <div className='wallet-modal__explanation grid-x grid-margin-x align-middle align-center'>
          <div className='cell shrink'>
            <img src={EtherIcon} />
          </div>
          <div className='cell small-22'>
            <div>The Studio deploys communities on Ethereum mainnet by Default (You can also test on Testnet to avoid fees - <a target='_blank' href='https://docs.fuse.io/the-fuse-studio/getting-started/using-the-studio-for-free-on-ropsten'>Learn here how</a>)</div>
          </div>
        </div>
      </div>
    </Modal>)
}
