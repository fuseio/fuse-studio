import React from 'react'
import Modal from 'components/common/Modal'
import ChangeNetwork from 'images/change_network.png'

const SwitchNetwork = ({ contentStyles, pluginName = 'plug-ins' }) => {
  return (
    <Modal className='switch__network'>
      <h3 className='switch__network__title'>Switch to Fuse chain to use {pluginName}</h3>
      <div className='switch__network__content' style={{ ...contentStyles }}>
        <div className='switch__network__text'>
          You need to switch to the Fuse chain on Metamask
        </div>
        <div className='switch__network__image'><img src={ChangeNetwork} /></div>
        <div className='switch__network__text'><a target='_blank' href='https://docs.fusenet.io/the-fuse-studio/how-to-add-fuse-to-your-metamask'>Click here</a> to learn how to add Fuse to your Metamask</div>
      </div>
    </Modal>
  )
}

export default SwitchNetwork
