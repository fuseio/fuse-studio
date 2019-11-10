import React from 'react'
import { connect } from 'react-redux'
import Modal from 'components/common/Modal'
import Missile from 'images/missile.svg'
import PortisIcon from 'images/portis_icon.svg'
import MetamaskIcon from 'images/metamask.png'
import { getNetworkType } from 'actions/network'
import { saveState } from 'utils/storage'

const ChooseProviderModal = ({
  hideModal,
  getNetworkType,
  setClicked
}) => {
  const handleClose = () => {
    hideModal()
  }

  const handleConnectWallet = (provider) => {
    if (setClicked) {
      setClicked(true)
    }
    saveState('state.provider', { provider })
    getNetworkType(true, provider)
    hideModal()
  }

  return (
    <Modal hasCloseBtn className='choose_provider__wrapper' onClose={handleClose}>
      <div className='choose_provider'>
        <h2 className='choose_provider__title'>Getting started on Fuse! <img src={Missile} /></h2>
        <p className='choose_provider__text'>
        In order to use the Fuse platform you will need to connect an Ethereum wallet choose one of the supported wallets to connect to your account:
        </p>

        <div className='choose_provider__options grid-x'>
          <div className='choose_provider__item cell medium-24'>
            <div className='choose_provider__item__title cell small-24'>Browser wallet</div>
            <div className='choose_provider__item__box cell medium-4 small-24 grid-x align-middle align-justify'>
              <a href='https://metamask.io/' target='_blank' rel='noopener noreferrer' className='cell medium-4 small-5'><img src={MetamaskIcon} /></a>
              <p className='cell medium-10 small-16 choose_provider__item__text'>Self custody browser extension based wallet</p>
              <button className='choose_provider__button button button--normal cell medium-8 small-24' disabled={window && window.ethereum && !window.ethereum.isMetaMask} onClick={() => handleConnectWallet('metamask')}><span>{window && window.ethereum && !window.ethereum.isMetaMask ? 'Not detected' : 'Connect Metamask'}</span></button>
            </div>
          </div>
          <div className='choose_provider__item cell medium-24'>
            <div className='choose_provider__item__title cell small-24'>Portis wallet</div>
            <div className='choose_provider__item__box cell medium-4 small-24 grid-x align-middle align-justify'>
              <a href='https://www.portis.io/' target='_blank' rel='noopener noreferrer' className='cell medium-4 small-5'><img src={PortisIcon} /></a>
              <p className='cell medium-10 small-16 choose_provider__item__text'>Create your new account or login using your phone</p>
              <button className='choose_provider__button button button--normal cell medium-8 small-24' onClick={() => handleConnectWallet('portis')}><span>Connect Portis</span></button>
            </div>
          </div>
        </div>

        <div className='choose_provider__text choose_provider__text--smaller'>
          Need help? click <a href='https://docs.fusenet.io/the-fuse-studio/getting-started' target='_blank' rel='noopener noreferrer'>here</a> for a guide
        </div>
      </div>
    </Modal>
  )
}

const mapStateToProps = (state) => ({
  isPortis: state.network.isPortis,
  isMetaMask: state.network.isMetaMask
})

const mapDispatchToProps = {
  getNetworkType
}

export default connect(mapStateToProps, mapDispatchToProps)(ChooseProviderModal)
