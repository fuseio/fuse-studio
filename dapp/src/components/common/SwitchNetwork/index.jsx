import React, { Fragment, useEffect } from 'react'
import { withRouter } from 'react-router'
import { useSelector } from 'react-redux'
import Modal from 'components/common/Modal'
import { convertNetworkName } from 'utils/network'
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

const renderNetworks = (networks) => networks.map((network) => capitalize(convertNetworkName(network))).reduce((prev, curr) => [prev, ' or ', curr])

const SwitchNetwork = ({
  hideModal,
  contentStyles,
  featureName = 'that page',
  desiredNetworkType = 'fuse',
  goBack = true
}) => {
  const { networkType } = useSelector(state => state.network)
  const fallbackNetwork = networkType || desiredNetworkType === 'fuse' ? 'ropsten' : 'main'
  const desiredNetworkTypeArray = Array.isArray(desiredNetworkType) ? desiredNetworkType : [desiredNetworkType]

  const onClose = () => {
    hideModal()
    // if (goBack) {
    //   history.goBack()
    // }
  }

  useEffect(() => {
    if (desiredNetworkTypeArray.includes(networkType)) {
      hideModal()
    }
    return () => { }
  }, [networkType])

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
                <div className='switch__network__image'><img src={switchImages[desiredNetworkTypeArray[0]][networkType || fallbackNetwork]} /></div>
                <div className='switch__network__text'>
                  <a target='_blank' href='https://tutorials.fuse.io/tutorials/network-tutorials/adding-fuse-network-to-metamask'>Click here</a> to learn how to add Fuse to your Metamask
                </div>
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
