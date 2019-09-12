import React, { Component } from 'react'
import PropTypes from 'prop-types'
import identity from 'lodash/identity'
import { formatWei } from 'utils/format'
import CommunityLogo from 'components/common/CommunityLogo'
import { isDaiToken } from 'constants/existingTokens'
import isEmpty from 'lodash/isEmpty'

export default class Community extends Component {
  handleClick = () => {
    const { token } = this.props
    if (token && token.communityAddress) {
      this.props.showDashboard(token.communityAddress)
    }
  }

  render () {
    const {
      token,
      networkType,
      metadata
    } = this.props
    const {
      name,
      totalSupply
    } = token

    const { image } = metadata
    return (
      <div className='community' onClick={this.handleClick}>
        <div className='community__logo'>
          <CommunityLogo
            isDaiToken={isDaiToken(networkType, token)}
            token={token}
            networkType={networkType}
            imageUrl={!isEmpty(image) ? `${CONFIG.ipfsProxy.urlBase}/image/${image}` : null}
            metadata={metadata}
          />
        </div>
        <div className='community__content'>
          <h3 className='community__content__title'>{name}</h3>
          <p className='community__content__members'>
            Total Supply
            <span>{formatWei(totalSupply, 0)}</span>
          </p>
        </div>
      </div>
    )
  }
}

Community.defaultProps = {
  token: {},
  metadata: {},
  showDashboard: identity
}

Community.propTypes = {
  coinWrapperClassName: PropTypes.string,
  token: PropTypes.object,
  metadata: PropTypes.object
}
