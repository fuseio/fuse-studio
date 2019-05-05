import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import identity from 'lodash/identity'
import { formatWei } from 'utils/format'
import CommunityLogo from 'components/elements/CommunityLogo'

export default class Community extends Component {
  handleClick = () => this.props.showDashboard(this.props.token.address)

  render () {
    return <div className={this.props.coinWrapperClassName} onClick={this.handleClick}>
      <div className='coin-header'>
        <CommunityLogo token={this.props.token} networkType={this.props.networkType} metadata={this.props.metadata} />
        <div className='coin-details'>
          <h3 className='coin-name'>{this.props.token.name}</h3>
          <p className='coin-total'>
            Total Supply
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
  showDashboard: identity
}

Community.propTypes = {
  coinWrapperClassName: PropTypes.string,
  token: PropTypes.object,
  metadata: PropTypes.object
}
