import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FontAwesome from 'react-fontawesome'
import BigNumber from 'bignumber.js'
import Loader from 'components/Loader'
import { REQUEST, PENDING, SUCCESS, FAILURE } from 'actions/constants'
import ReactGA from 'services/ga'
import CommunityLogo from 'components/elements/CommunityLogo'
import TransactionButton from 'components/common/TransactionButton'
import Message from 'components/common/Message'
import contractIcon from 'images/contract.svg'

export default class SummaryStep extends Component {
  state = {
    showError: true
  }

  renderTransactionStatus = (transactionStatus) => {
    switch (transactionStatus) {
      case REQUEST:
        return (
          <button className='button button--normal' disabled>Issue</button>
        )
      case PENDING:
        return <Loader color='#3a3269' className='loader' />
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
      setNextStep,
      isOpen
    } = this.props

    const { showError } = this.state
    if (transactionStatus === PENDING) {
      setNextStep()
      return ''
    }

    const contractsItems = Object.values(contracts)
      .filter((contract) => contract.checked)
      .map((contract) => contract.label)

    return (
      <div className='summary-step'>
        <div className='summary-step__wrapper'>
          <div className='summary-step__inner'>
            <div className='summary-step__logo'>
              <CommunityLogo networkType={networkType} token={{ symbol: communitySymbol }} metadata={{ communityLogo }} />
              <span>{communityName} coin</span>
            </div>
            <hr className='summary-step__line' />
            <div className='summary-step__content'>
              <div className='summary-step__content__item'>
                <h4 className='summary-step__content__title'>Currency type</h4>
                <p>Mintable burnable token</p>
              </div>
              <div className='summary-step__content__item'>
                <h4 className='summary-step__content__title'>Total supply</h4>
                <p>{totalSupply}</p>
              </div>
              <div className='summary-step__content__item'>
                <h4 className='summary-step__content__title'>Contracts</h4>
                <div className='summary-step__content__contracts'>

                  {
                    contractsItems.map(item => (
                      <div key={item}>
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

SummaryStep.propTypes = {
  transactionStatus: PropTypes.string
}
