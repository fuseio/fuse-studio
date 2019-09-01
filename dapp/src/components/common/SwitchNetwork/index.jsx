import React from 'react'
import ChangeNetwork from 'images/change_network.png'

const SwitchNetwork = () => {
  return (
    <div className='switch__network'>
      <h3 className='switch__network__title'>Switch to fuse chain</h3>
      <div className='switch__network__content'>In order to use Community 123 you need to switch to the Fuse chain
        To add Fuse chain on metamask, please add a custom RPC and enter https://rpc.fusenet.io</div>
      <div className='switch__network__image'><img src={ChangeNetwork} /></div>
    </div>
  )
}

export default SwitchNetwork
