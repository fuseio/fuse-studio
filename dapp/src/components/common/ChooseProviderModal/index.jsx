import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import Modal from 'components/common/Modal'
import Missile from 'images/missile.svg'
import PortisIcon from 'images/portis_icon.svg'
import MetamaskIcon from 'images/metamask.png'
import { getNetworkType } from 'actions/network'

const ChooseProviderModal = ({
  hideModal,
  getNetworkType,
  isMetaMask,
  isPortis,
  setClicked
}) => {
  const to = useMemo(() => {
    if (isMetaMask) {
      return 'Metamask'
    } else if (isPortis) {
      return 'Portis'
    }
  }, [isPortis, isMetaMask])

  const handleClose = () => {
    hideModal()
  }

  const handleConnectWallet = () => {
    if (setClicked) {
      setClicked(true)
    }
    getNetworkType(true)
    hideModal()
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
          <div className='choose_provider__metamask'>
            <img src={MetamaskIcon} />
            <span>Metamask</span>
          </div>
          <div className='choose_provider__portis'>
            <img src={PortisIcon} />
            <span>Portis</span>
          </div>
        </div>

        <button className='choose_provider__button button button--normal' disabled={!to} onClick={handleConnectWallet}>Connect {!to
          ? (
            <React.Fragment>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </React.Fragment>
          ) : to
        }</button>
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
