import React from 'react'
import { connect } from 'react-redux'
import Modal from 'components/Modal'

import ClnIcon from 'images/cln.png'
import LockIcon from 'images/lock.png'
import MetamaskIcon from 'images/metamask.png'

class LoginModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      finishInstall: false
    }
  }

  onClose = () => {
    this.props.hideModal()
  }

  finishInstalling = () => {
    window.location.reload(false)
  }

  installMetamask = () => {
    this.setState({
      finishInstall: true
    })
    window.open('https://metamask.io/', '_blank')
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.network.isMetaMask && nextProps.network.accountAddress) {
      this.props.hideModal()
    }
  }

  render () {
    let modalContent
    if (this.state.finishInstall) {
      modalContent = <div className='modal-content-wrapper'>
        <img src={MetamaskIcon} />
        <h4>Finish installing MetaMask to continue</h4>
        <p>Make sure you follow the instruction on MetaMask to finish the installation.</p>
        <div className='button' onClick={this.finishInstalling}>I INSTALLED METAMASK</div>
      </div>
    } else if (!this.props.network.isMetaMask) {
      modalContent = <div className='modal-content-wrapper'>
        <div className='images flex center'>
          <img src={ClnIcon} />
          <span>+</span>
          <img src={MetamaskIcon} />
        </div>
        <h4>Want to connect?</h4>
        <p>You’ll need a safe place to store your coins, in order to do that you need to download the MetaMask wallet. The wallet will also act as your login to the dashboard.</p>
        <div className='button' onClick={this.installMetamask}>INSTALL METAMASK</div>
      </div>
    } else if (!this.props.network.accountAddress) {
      modalContent = <div className='modal-content-wrapper'>
        <img className='lock-icon' src={LockIcon} />
        <h4>Your MetaMask is locked</h4>
        <p>Please unlock your MetaMask extension in order to use the dashboard.</p>
      </div>
    }

    return (
      <Modal onClose={this.onClose}>
        {modalContent}
      </Modal>
    )
  }
}

const mapStateToProps = state => {
  return {
    network: state.network
  }
}

export default connect(mapStateToProps)(LoginModal)
