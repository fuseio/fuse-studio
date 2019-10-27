import React, { Fragment } from 'react'
import Modal from 'components/common/Modal'
import ChangeNetwork from 'images/change_network.png'
import WrongNetwork from 'images/wrong_network.svg'
import capitalize from 'lodash/capitalize'

const renderNetworks = (networks) => networks.map(capitalize).reduce((prev, curr) => [prev, ' or ', curr])

const SwitchNetwork = ({ contentStyles, featureName = 'that page', desiredNetworkType = 'fuse' }) => {
  const desiredNetworkTypeArray = Array.isArray(desiredNetworkType) ? desiredNetworkType : [desiredNetworkType]
  return (
    <Modal className='switch__network'>
      <h3 className='switch__network__title'>Switch to {renderNetworks(desiredNetworkTypeArray)} Network to use {featureName}</h3>
      <div className='switch__network__content' style={{ ...contentStyles }}>
        <div className='switch__network__text'>
          You need to switch to the {renderNetworks(desiredNetworkTypeArray)} Network on Metamask
        </div>
        {
          desiredNetworkTypeArray.includes('fuse')
            ? <Fragment>
              <div className='switch__network__image'><img src={ChangeNetwork} /></div>
              <div className='switch__network__text'><a target='_blank' href='https://docs.fusenet.io/the-fuse-studio/how-to-add-fuse-to-your-metamask'>Click here</a> to learn how to add Fuse to your Metamask</div>
            </Fragment> : <div className='switch__network__image'><img src={WrongNetwork} /></div>
        }
      </div>
    </Modal>
  )
}

export default SwitchNetwork
