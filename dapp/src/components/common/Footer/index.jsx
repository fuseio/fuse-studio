import React, { Component } from 'react'
import { withNetwork } from 'containers/Web3'
import capitalize from 'lodash/capitalize'
import classNames from 'classnames'

class Footer extends Component {
  render () {
    const { networkType } = this.props
    return (
      <div className='footer'>
        <div className='footer__item'>
          <span className={classNames('footer__status_dot', { 'footer__status_dot--on': networkType }, { 'footer__status_dot--off': !networkType })} />
          Connected to {capitalize(networkType)} network
        </div>
        <div className='footer__item footer__item--last'>
          <span>All right reserve&nbsp;|&nbsp;</span>
          <span>Fuse 2019&nbsp;|&nbsp;</span>
          <span style={{ fontWeight: 'bold' }}>BETA</span>
        </div>
      </div>
    )
  }
}

export default withNetwork(Footer)
