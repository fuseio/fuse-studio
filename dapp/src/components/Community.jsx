import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import identity from 'lodash/identity'
import { formatWei } from 'utils/format'
import CommunityLogo from 'components/elements/CommunityLogo'

export default class Community extends Component {
  handleClick = () => {
    const { token } = this.props
    if (token && token.communityAddress) {
      this.props.showDashboard(token.communityAddress)
    }
  }

  render () {
    const {
      coinWrapperClassName,
      token,
      networkType
    } = this.props
    const {
      symbol,
      name,
      totalSupply
    } = token

    return (
      <div className={coinWrapperClassName} onClick={this.handleClick}>
        <div className='coin-header'>
          <CommunityLogo
            isDaiToken={symbol && symbol === 'DAI'}
            token={token}
            networkType={networkType}
            metadata={this.props.metadata}
          />
          <div className='coin-details'>
            <h3 className='coin-name'>{name}</h3>
            <p className='coin-total'>
              Total Supply
              <span className={classNames('total-text', 'positive-number')}>
                {formatWei(totalSupply, 0)}
              </span>
            </p>
          </div>
        </div>
      </div>
    )
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
