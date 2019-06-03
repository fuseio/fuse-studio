import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import BigNumber from 'bignumber.js'
import { PENDING, SUCCESS, FAILURE } from 'actions/constants'
import ReactGA from 'services/ga'
import CommunityLogo from 'components/elements/CommunityLogo'
import TransactionButton from 'components/common/TransactionButton'
import Message from 'components/common/Message'
import contractIcon from 'images/contract.svg'
import DeployProgress from './DeployProgress'

export default class SummaryStep extends Component {
  state = {
    showError: true,
    showProgress: false
  }

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
    ReactGA.event({
      category: 'Issuance',
      action: 'Load',
      label: 'Finished'
    })
  }

  componentDidUpdate (prevProps) {
    if (this.props.transactionStatus === SUCCESS && prevProps.transactionStatus !== SUCCESS) {
      ReactGA.event({
        category: 'Issuance',
        action: 'Load',
        label: 'Issued'
      })
    }

    if (this.props.transactionStatus === PENDING && (this.props.transactionStatus !== prevProps.transactionStatus)) {
      // this.props.setNextStep()
      this.setState({ showProgress: true })
    }

    if (this.props.transactionStatus === FAILURE && (this.props.transactionStatus !== prevProps.transactionStatus)) {
      this.setState({ showProgress: false })
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
      createTokenSignature,
      transactionStatus,
      isOpen,
      communityType,
      existingToken,
      history,
      currentDeploy
    } = this.props

    const { showError, showProgress } = this.state

    const contractsItems = Object.values(contracts)
      .filter((contract) => contract.checked)
      .map((contract) => contract.label)

    return (
      <div className='summary-step'>
        <div className='summary-step__wrapper'>
          <div className='summary-step__inner'>
            <div className='summary-step__logo'>
              <CommunityLogo isDaiToken={communityType && communityType.value === 'existingToken'} networkType={networkType} token={{ symbol: communitySymbol }} metadata={{ communityLogo }} />
              <span>{communityName} coin</span>
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
                    contractsItems.map(item => (
                      <div key={item} className='summary-step__content__contracts__item'>
                        <span className='summary-step__content__contracts__icon'><img src={contractIcon} />{item}</span>
                        {
                          item && item.includes('Members') && isOpen && (
                            <span className='summary-step__content__contracts__small'>Open community</span>
                          )
                        }
                        {
                          item && item.includes('Members') && !isOpen && (
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

          {
            showProgress && <DeployProgress
              history={history}
              contracts={contracts}
              currentDeploy={currentDeploy}
            />
          }

          <Message
            radiusAll
            isOpen={createTokenSignature}
            message='Pending'
            isDark
          />
          <Message
            radiusAll
            isOpen={transactionStatus === FAILURE && showError}
            message='Something went wrong'
            clickHandler={() => this.setState({ showError: false })}
            subTitle='Try again later'
          />
        </div>
        <div className='grid-x align-center summary-step__issue'>
          {this.renderTransactionStatus(this.props.transactionStatus)}
        </div>
      </div>
    )
  }
}
