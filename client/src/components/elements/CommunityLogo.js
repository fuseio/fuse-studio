import React from 'react'
import PropTypes from 'prop-types'
import Loader from 'components/Loader'
import classNames from 'classnames'
import logoDarkBlue from 'images/token-dark_blue.svg'
import logoGreen from 'images/token-green.svg'
import logoGreenGradiant from 'images/token-green_gradient.svg'

const pictureEnum = {
  'CoinIcon1.svg': logoGreen,
  'CoinIcon2.svg': logoGreenGradiant,
  'CoinIcon3.svg': logoDarkBlue
}

const CommunityLogo = ({ metadata: { communityLogo }, token: { symbol }, isSmall = false, isBig = false }) => {
  const wrapperClasses = classNames(`logo-circle__outer`,
    { 'logo-circle__outer--normal': !isSmall && !isBig },
    { 'logo-circle__outer--small': isSmall && !isBig },
    { 'logo-circle__outer--big': isBig && !isSmall },
    { ['logo-circle__outer--' + communityLogo]: true }
  )

  return (
    <div className={wrapperClasses}>
      {
        communityLogo
          ? (
            <img src={pictureEnum[communityLogo] || logoGreen} className='logo-circle__inner' alt='Community Logo' />
          )
          : <Loader color='#fff' className='logo-img' />
      }
      <span className='logo-circle__name'>{symbol}</span>
    </div>
  )
}

CommunityLogo.propTypes = {
  token: PropTypes.object.isRequired,
  metadata: PropTypes.object
}

export default CommunityLogo
