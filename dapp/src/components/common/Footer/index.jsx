import React, { Component } from 'react'
import { withNetwork } from 'containers/Web3'
import capitalize from 'lodash/capitalize'

class Footer extends Component {
  render () {
    const { networkType } = this.props
    return (
      <div className='footer'>
        <div className='footer__item'>
          <span className='footer__status_dot' />
          Connected to {capitalize(networkType)} network
        </div>
        <div className='footer__item footer__item--last'>
          <span>All right reserve&nbsp;|&nbsp;</span>
          <span>fuse 2019&nbsp;|&nbsp;</span>
          <span style={{ fontWeight: 'bold' }}>Beta</span>
        </div>
      </div>
    )
  }
}

export default withNetwork(Footer)
