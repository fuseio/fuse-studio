import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {formatWei} from 'utils/format'
import classNames from 'classnames'
import CommunityLogo from 'components/elements/CommunityLogo'
import ReactGA from 'services/ga'
import identity from 'lodash/identity'

export default class Community extends Component {
  showDashboard = (address) => {
    this.props.history.push(`/view/dashboard/${address}`)
    ReactGA.event({
      category: 'Dashboard',
      action: 'Click',
      label: 'dashboard'
    })
  }

  render () {
    return <div className={this.props.coinWrapperClassName} onClick={() => this.showDashboard(this.props.token.address)}>
      <div className='coin-header' onClick={this.props.handleOpen}>
        <CommunityLogo token={this.props.token} metadata={this.props.metadata} />
        <div className='coin-details'>
          <h3 className='coin-name'>{this.props.token.name}</h3>
          <p className='coin-total'>
            Total CC supply
            <span className={classNames('total-text', 'positive-number')}>
              {formatWei(this.props.token.totalSupply, 0)}
            </span>
          </p>
        </div>
      </div>
    </div>
  }
}

Community.defaultProps = {
  coinWrapperClassName: 'coin-wrapper',
  token: {},
  metadata: {},
  handleOpen: identity
}

Community.propTypes = {
  coinWrapperClassName: PropTypes.string,
  handleOpen: PropTypes.func,
  token: PropTypes.object,
  metadata: PropTypes.object
}
