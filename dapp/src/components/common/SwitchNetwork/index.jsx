import React from 'react'
import ChangeNetwork from 'images/change_network.png'

const SwitchNetwork = () => {
  return (
    <div className='switch__network'>
      <h3 className='switch__network__title'>Switch to Fuse chain to use plug-ins</h3>
      <div className='switch__network__content switch__network__content--space'>
        You need to switch to the Fuse chain on Metamask: <br />
      </div>
      <div className='switch__network__image'><img src={ChangeNetwork} /></div>
      <div className='switch__network__content'><a target='_blank' href='https://docs.fusenet.io/the-fuse-studio/how-to-add-fuse-to-your-metamask'>Click here</a> to learn how to add Fuse to your Metamask</div>
    </div>
  )
}

export default SwitchNetwork
