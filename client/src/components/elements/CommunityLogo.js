import React from 'react'
import PropTypes from 'prop-types'
import Loader from 'components/Loader'
import classNames from 'classnames'

const CommunityLogo = ({ metadata: { communityLogo }, token: { symbol }, isSmall = false }) =>
  <div className={classNames(`logo-circle__outer`, { ['logo-circle__outer--' + communityLogo]: true }, { 'logo-circle__outer--normal': !isSmall }, { 'logo-circle__outer--small': isSmall })}>
    {
      communityLogo
        ? <div className={classNames('logo-circle__inner', { 'logo-circle__inner--normal': !isSmall }, { 'logo-circle__inner--small': isSmall })} />
        : <Loader color='#fff' className='logo-img' />
    }
    <span className='logo-circle__name'>{symbol}</span>
  </div>

CommunityLogo.propTypes = {
  token: PropTypes.object.isRequired,
  metadata: PropTypes.object
}

export default CommunityLogo
