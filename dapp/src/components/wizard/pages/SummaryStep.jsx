import React, { useMemo } from 'react'
import FontAwesome from 'react-fontawesome'
// import CommunityLogo from 'components/common/CommunityLogo'
import { connect, getIn } from 'formik'
import useSwitchNetwork from 'hooks/useSwitchNetwork'
import pickBy from 'lodash/pickBy'
import pluginsIcons from 'constants/pluginsIcons'
import upperCase from 'lodash/upperCase'
import lowerCase from 'lodash/lowerCase'
import upperFirst from 'lodash/upperFirst'

const SummaryStep = ({
  networkType,
  formik,
  homeNetwork
}) => {
  const desiredNetworkType = useMemo(() => {
    if (!networkType) {
      return ['mainnet', 'ropsten']
    } else if (networkType === homeNetwork) {
      return ['ropsten', 'mainnet']
    } else {
      const secondDesired = networkType === 'ropsten' ? 'mainnet' : 'ropsten'
      return [networkType, secondDesired]
    }
  }, [])

  useSwitchNetwork(desiredNetworkType, { featureName: 'Wizard' })
  const contracts = getIn(formik.values, 'contracts')
  // const communitySymbol = getIn(formik.values, 'communitySymbol')
  const totalSupply = getIn(formik.values, 'totalSupply')
  // const communityName = getIn(formik.values, 'communityName')
  const isOpen = getIn(formik.values, 'isOpen')
  const communityType = getIn(formik.values, 'communityType')
  const existingToken = getIn(formik.values, 'existingToken')
  const images = getIn(formik.values, 'images')
  const plugins = getIn(formik.values, 'plugins')
  const coverPhoto = getIn(formik.values, 'coverPhoto')

  const pluginsSelected = React.useMemo(() => {
    return Object.keys(pickBy(plugins, { isActive: true }))
  }, [])

  const { chosen } = images

  const contractsItems = Object.values(contracts)
    .filter((contract) => contract.checked)
    .map(({ label, icon }) => ({ label, icon }))

  return (
    <div className='summary-step'>
      <div className='summary-step__wrapper'>
        <div className='summary-step__inner'>
          <div className='summary-step__images'>
            <img alt='cover photo' src={(coverPhoto && coverPhoto.croppedImageUrl)} />
            <div className='summary-step__logo'>
              <img src={images && images[chosen] && images[chosen].croppedImageUrl} />
              {/* <CommunityLogo
                imageUrl={images && images[chosen] && images[chosen].croppedImageUrl}
                metadata={{
                  isDefault: chosen !== 'custom' && !existingToken
                }}
                symbol={communitySymbol}
              /> */}
              {/* <span className='communityName'>{communityName} coin</span> */}
            </div>
          </div>
          {/* <hr className='summary-step__line' /> */}
          <div className='summary-step__content'>
            <div className='summary-step__content__item'>
              <h4 className='summary-step__content__title'>Currency type</h4>
              {communityType && <p>{communityType.label}</p>}
              {existingToken && <p>{`Existing token - ${existingToken.label}`}</p>}
            </div>
            {
              totalSupply && (
                <div className='summary-step__content__item'>
                  <h4 className='summary-step__content__title'>Total supply</h4>
                  <p>{totalSupply}</p>
                </div>
              )
            }
            <div className='summary-step__content__item'>
              <h4 className='summary-step__content__title'>Contracts</h4>
              <div className='summary-step__content__contracts'>
                {
                  contractsItems.map(({ icon, label }) => label && (
                    <div key={label} className='summary-step__content__contracts__item'>
                      <span className='summary-step__content__contracts__icon'><img src={icon} />{label}</span>
                      {
                        label && label.includes('Members') && isOpen && (
                          <span className='summary-step__content__contracts__small'>Open community</span>
                        )
                      }
                      {
                        label && label.includes('Members') && !isOpen && (
                          <span className='summary-step__content__contracts__small'>Close community</span>
                        )
                      }
                    </div>
                  ))
                }
              </div>
            </div>
            <div className='summary-step__content__item'>
              <h4 className='summary-step__content__title'>Plugins</h4>
              <div className='summary-step__content__contracts'>
                {
                  pluginsSelected.map((name) => name && (
                    <div key={name} className='summary-step__content__contracts__item'>
                      <span className='summary-step__content__contracts__icon'>
                        <img src={pluginsIcons[name]} />
                        {upperFirst(lowerCase(upperCase(name)))}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>

        <div className='summary-step__text'>
          <span><FontAwesome name='info-circle' /> Your coin will be issued on the Ethereum {networkType}</span>
          <br />
          <span>After published a bridge will allow you to start using your coin on the Fuse-chain!</span>
        </div>
      </div>
    </div>
  )
}

export default connect(SummaryStep)
