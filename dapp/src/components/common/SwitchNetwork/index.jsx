import React, { Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import Modal from 'components/common/Modal'
import capitalize from 'lodash/capitalize'
import RopstenToFuse from 'images/Ropsten_To_Fuse.png'
import MainToFuse from 'images/Main_To_Fuse.png'
import SwitchToMain from 'images/Switch_To_Main.png'
import SwitchToRopsten from 'images/Switch_To_Ropsten.png'

const switchImages = {
  fuse: {
    ropsten: RopstenToFuse,
    main: MainToFuse
  },
  main: SwitchToMain,
  ropsten: SwitchToRopsten
}

const renderNetworks = (networks) => networks.map(capitalize).reduce((prev, curr) => [prev, ' or ', curr])

const SwitchNetwork = ({
  history,
  hideModal,
  networkType,
  contentStyles,
  featureName = 'that page',
  desiredNetworkType = 'fuse',
  goBack = true
}) => {
  const desiredNetworkTypeArray = Array.isArray(desiredNetworkType) ? desiredNetworkType : [desiredNetworkType]

  const onClose = () => {
    hideModal()
    if (goBack) {
      history.goBack()
    }
  }

  return (
    <Modal className='switch__network' hasCloseBtn onClose={onClose}>
      <h3 className='switch__network__title'>Switch to {renderNetworks(desiredNetworkTypeArray)} Network to use {featureName}</h3>
      <div className='switch__network__content' style={{ ...contentStyles }}>
        <div className='switch__network__text'>
          You need to switch to the {renderNetworks(desiredNetworkTypeArray)} Network on Metamask
        </div>
        {
          desiredNetworkTypeArray.includes('fuse')
            ? (
              <Fragment>
                <div className='switch__network__image'><img src={switchImages[desiredNetworkTypeArray[0]][networkType]} /></div>
                <div className='switch__network__text'><a target='_blank' href='https://docs.fusenet.io/the-fuse-studio/how-to-add-fuse-to-your-metamask'>Click here</a> to learn how to add Fuse to your Metamask</div>
              </Fragment>
            ) : (
              <Fragment>
                <div className='switch__network__image'>
                  <img src={switchImages[desiredNetworkTypeArray[0]]} />
                </div>
              </Fragment>
            )
        }
      </div>
    </Modal>
  )
}

export default withRouter(SwitchNetwork)
