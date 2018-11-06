import React, {Component} from 'react'
import FontAwesome from 'react-fontawesome'
import Community from 'components/Community'

export default class SummaryStep extends Component {
  render () {
    return <div>
      <h2 className='step-content-title text-center'>Your community currency is ready to be born!</h2>,
      <div className='step-content-summary'>
        <div className='list-item'>
          <Community token={{
            symbol: this.props.communitySymbol,
            name: this.props.communityName,
            totalSupply: this.props.totalSupply
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
