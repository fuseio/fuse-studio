import React from 'react'
import FontAwesome from 'react-fontawesome'
import CommunityLogo from 'components/common/CommunityLogo'
import { connect, getIn } from 'formik'

const SummaryStep = ({
  networkType,
  formik
}) => {
  const contracts = getIn(formik.values, 'contracts')
  const communitySymbol = getIn(formik.values, 'communitySymbol')
  const totalSupply = getIn(formik.values, 'totalSupply')
  const communityName = getIn(formik.values, 'communityName')
  const isOpen = getIn(formik.values, 'isOpen')
  const communityType = getIn(formik.values, 'communityType')
  const existingToken = getIn(formik.values, 'existingToken')
  const images = getIn(formik.values, 'images')

  const { chosen } = images

  const contractsItems = Object.values(contracts)
    .filter((contract) => contract.checked)
    .map(({ label, icon }) => ({ label, icon }))

  return (
    <div className='summary-step'>
      <div className='summary-step__wrapper'>
        <div className='summary-step__inner'>
          <div className='summary-step__logo'>
            <CommunityLogo
              imageUrl={images && images[chosen] && images[chosen].croppedImageUrl}
              metadata={{
                isDefault: communityType && communityType.value && communityType.label
              }}
              token={{ symbol: communitySymbol }}
            />
            <span className='communityName'>{communityName} coin</span>
          </div>
          <hr className='summary-step__line' />
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
