import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Community from 'components/Community'
import BigNumber from 'bignumber.js'
import Loader from 'components/Loader'
import {REQUEST, PENDING, SUCCESS} from 'actions/constants'

const canInsertCLN = () => false

export default class SummaryStep extends Component {
  renderTransactionStatus = (transactionStatus) => {
    switch (transactionStatus) {
      case REQUEST:
        return (<button className='symbol-btn' disabled>
          Issue
        </button>)
      case PENDING:
        return <Loader color='#3a3269' className='loader' />
      case SUCCESS:
        return null
      default:
        return (<button onClick={this.props.showPopup} className='symbol-btn'>
          Issue
        </button>)
    }
  }

  getToken = () => ({
    symbol: this.props.communitySymbol,
    name: this.props.communityName,
    totalSupply: new BigNumber(this.props.totalSupply.toString()).multipliedBy(1e18),
    mmAddress: this.props.EllipseMarketMakerLibAddress,
    metadata: {
      communityLogo: this.props.communityLogo
    }
  })

  render () {
    return <div>
      <h2 className='step-content-title text-center'>Your community currency is ready to be born!</h2>
      <div className='step-content-summary'>
        <div className='list-item'>
          <Community
            canInsertCLN={canInsertCLN}
            usdPrice={0}
            loadCalculator={this.props.loadCalculator}
            token={this.getToken()}
            wrapper={'summary'}
          />
        </div>
      </div>
      <div className='text-center wallet-container'>
        {this.renderTransactionStatus(this.props.transactionStatus)}
      </div>
    </div>
  }
}

SummaryStep.propTypes = {
  transactionStatus: PropTypes.string,
  EllipseMarketMakerLibAddress: PropTypes.string
}
