import React from 'react'
import Modal from 'components/Modal'
import FontAwesome from 'react-fontawesome'
import Bg from 'images/popup-metamask.svg'

const MetamaskModal = (props) => {
  return (
    <Modal className='metamask-popup' onClose={props.hideModal}>
      <div className='metamask-popup-header'>
        <div className='metamask-popup-close' onClick={props.hideModal}>
          <FontAwesome name='times' />
        </div>
        <img src={Bg} />
        <h3 className='metamask-popup-title'>Your brand new community currency is one step away from changing the world!</h3>
        <p className='metamask-popup-text'>
          To finish the issuance of your currency you will now continue to MetaMask website do add a wallet chrome extension.
        </p>
        <button className='metamask-popup-btn' onClick={props.setIssuanceTransaction}>Metamask <FontAwesome name='angle-right' /></button>
      </div>
      <div className='metamask-popup-container'>
        <p className='metamask-popup-text'>
          <strong>After adding MetaMask wallet, you have the power to choose:</strong>
        </p>
        <p className='metamask-popup-text'>
          1. Main Ethereum Network (live network)- Add ETH to your wallet, pay for your currency issuance  and spread your word to the world (*amount to be paid -gas- will be presented on MetaMask)
        </p>
        <p className='metamask-popup-text'>
          2. Ropsten Test Network- Add ETH Test to your wallet, pay for your currency and spread your word to the test world (*you can visit this Faucet website to get ETH Test coins
          <a href='https://faucet.metamask.io/' className='metamask-popup-link' target='_blank'>
            <FontAwesome name='arrow-right' />
          </a>
        )
        </p>
      </div>
    </Modal>
  )
}

export default MetamaskModal
