import React from 'react'

import Metamask from 'images/metamask-dark.png'

class OpenMetamask extends React.Component {
  componentDidUpdate () {
    if (this.props.transactionHash) {
      this.props.next()
    }
  }

  render () {
    return (
      <div className='metamask-sign'>
        <h4>METAMASK EXTENSION</h4>
        <div className='summary-prices-wrapper'>
          <img className='metamask-icon' src={Metamask} />
          <p>Sign the transaction in your MetaMask extension</p>
        </div>
      </div>
    )
  }
}

export default OpenMetamask
