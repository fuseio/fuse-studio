import React from 'react'
import { connect } from 'react-redux'
import Modal from 'components/common/Modal'
import Missile from 'images/missile.svg'
import PortisIcon from 'images/portis_icon.svg'
import MetamaskIcon from 'images/metamask.png'
import { getNetworkType } from 'actions/network'

const ChooseProviderModal = ({
  hideModal,
  getNetworkType
}) => {
  const handleClose = () => {
    hideModal()
  }

  const handleConnectWallet = () => {
    getNetworkType()
  }

  return (
    <Modal hasCloseBtn className='choose_provider__wrapper' onClose={() => handleClose()}>
      <div className='choose_provider'>
        <h2 className='choose_provider__title'>Getting started! <img src={Missile} /></h2>
        <p className='choose_provider__text'>
          In order to start the wizard you will need an Ethereum account with some ETH for funding
          (click <a href='https://docs.fusenet.io/the-fuse-studio/getting-started' target='_blank' rel='noopener noreferrer'>here</a> for a guide).
        </p>

        <div className='choose_provider__options'>
          <a className='choose_provider__metamask' href='https://metamask.io/' target='_blank' rel='noopener noreferrer'>
            <img src={MetamaskIcon} />
            <span>Metamask</span>
          </a>
          <a className='choose_provider__portis' href='https://wallet.portis.io/login/?widget=1&dappId=ff4643ff-4583-4b85-9a91-773b0fb07f8a&dappDomain=https://studio.fusenet.io&dappName=Fuse%20Studio&dappLogoUrl=https://portis-prod.s3.amazonaws.com/assets/dapps-logo/83f4d2de-2ce4-4024-8826-26be6d6e6a38.png&email=' target='_blank' rel='noopener noreferrer'>
            <img src={PortisIcon} />
            <span>Portis</span>
          </a>
        </div>

        <button className='choose_provider__button button button--normal' onClick={handleConnectWallet}>Connect wallet</button>
      </div>
    </Modal>
  )
}

const mapDispatchToProps = {
  getNetworkType
}

export default connect(null, mapDispatchToProps)(ChooseProviderModal)
