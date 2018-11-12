import React, {Component} from 'react'
import FontAwesome from 'react-fontawesome'
import Community from 'components/Community'
import BigNumber from 'bignumber.js'
export default class SummaryStep extends Component {
  render () {
    return <div>
      <h2 className='step-content-title text-center'>Your community currency is ready to be born!</h2>,
      <div className='step-content-summary'>
        <div className='list-item'>
          <Community token={{
            symbol: this.props.communitySymbol,
            name: this.props.communityName,
            totalSupply: new BigNumber(this.props.totalSupply.toString()).multipliedBy(1e18)
          }} usdPrice={0} />
        </div>
      </div>,
      <div className='text-center wallet-container'>
        <a href='https://metamask.io/' target='_blank' className='btn-download'>
          <FontAwesome name='download' /> Metamask wallet
        </a>
      </div>,
      <div className='text-center'>
        <button onClick={this.props.showPopup} className='symbol-btn' disabled={this.props.disabledDoneBtn}>
          Issue
        </button>
      </div>
    </div>
  }
}
