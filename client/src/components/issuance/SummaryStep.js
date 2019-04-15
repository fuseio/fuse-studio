import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Community from 'components/Community'
import BigNumber from 'bignumber.js'
import Loader from 'components/Loader'
import {REQUEST, PENDING, SUCCESS} from 'actions/constants'
import ReactGA from 'services/ga'

export default class SummaryStep extends Component {
  renderTransactionStatus = (transactionStatus) => {
    switch (transactionStatus) {
      case REQUEST:
        return (<button className='button button--normal' disabled>
          Issue
        </button>)
      case PENDING:
        return <Loader color='#3a3269' className='loader' />
      case SUCCESS:
        return null
      default:
        return (<button onClick={this.props.showPopup} className='button button--big'>
          Issue
        </button>)
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
    if (this.transactionStatus === SUCCESS && prevProps.transactionStatus !== SUCCESS) {
      ReactGA.event({
        category: 'Issuance',
        action: 'Load',
        label: 'Issued'
      })
    }
  }

  render () {
    return <div>
      <h2 className='step-content-title text-center'>Your community currency is ready to be born!</h2>
      <div className='step-content-summary'>
        <div className='list-item'>
          <Community token={this.getToken()} metadata={{communityLogo: this.props.communityLogo}} />
        </div>
      </div>
      <div className='text-center wallet-container'>
        {this.renderTransactionStatus(this.props.transactionStatus)}
      </div>
    </div>
  }
}

SummaryStep.propTypes = {
  transactionStatus: PropTypes.string
}
