import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import BigNumber from 'bignumber.js'
import { PENDING, SUCCESS } from 'actions/constants'
// import ReactGA from 'services/ga'
import CommunityLogo from 'components/common/CommunityLogo'
import TransactionButton from 'components/common/TransactionButton'

export default class SummaryStep extends Component {
  renderTransactionStatus = (transactionStatus) => {
    switch (transactionStatus) {
      case PENDING:
        return null
      case SUCCESS:
        return null
      default:
        return (
          <TransactionButton clickHandler={this.props.showPopup} frontText='ISSUE' />
        )
    }
  }

  getToken = () => ({
    symbol: this.props.communitySymbol,
    name: this.props.communityName,
    totalSupply: new BigNumber(this.props.totalSupply.toString()).multipliedBy(1e18)
  })

  componentDidMount () {
    // ReactGA.event({
    //   category: 'Issuance',
    //   action: 'Load',
    //   label: 'Finished'
    // })
  }

  componentDidUpdate (prevProps) {
    if (this.props.transactionStatus === PENDING && (this.props.transactionStatus !== prevProps.transactionStatus)) {
      this.props.setNextStep()
    }
  }

  render () {
    const {
      networkType,
      communitySymbol,
      communityLogo,
      totalSupply,
      communityName,
      contracts,
      isOpen,
      communityType,
      existingToken,
      images
    } = this.props

    const contractsItems = Object.values(contracts)
      .filter((contract) => contract.checked)
      .map(({ label, icon }) => ({ label, icon }))

    return (
      <div className='summary-step'>
        <div className='summary-step__wrapper'>
          <div className='summary-step__inner'>
            <div className='summary-step__logo'>
              <CommunityLogo
                imageUrl={images && images.croppedImageUrl}
                isDaiToken={communityType && communityType.value === 'existingToken'}
                networkType={networkType}
                token={{ symbol: communitySymbol }}
                metadata={{ communityLogo }}
              />
              <span className='communityName'>{communityName} coin</span>
            </div>
            <hr className='summary-step__line' />
            <div className='summary-step__content'>
              <div className='summary-step__content__item'>
                <h4 className='summary-step__content__title'>Currency type</h4>
                {totalSupply && communityType && communityType.value !== 'existingToken' && <p>{communityType.text}</p>}
                {communityType && communityType.value === 'existingToken' && <p>{`${communityType.text} - ${existingToken.label}`}</p>}
              </div>
              {
                totalSupply && communityType && communityType.value !== 'existingToken' && (
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
        <div className='grid-x align-center summary-step__issue'>
          {this.renderTransactionStatus(this.props.transactionStatus)}
        </div>
      </div>
    )
  }
}
