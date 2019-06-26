import React from 'react'
import PropTypes from 'prop-types'
import Loader from 'components/common/Loader'
import classNames from 'classnames'
import DAI_1 from 'images/DAI_CoinIcon1.svg'
import DAI_2 from 'images/DAI_CoinIcon2.svg'
import DAI_3 from 'images/DAI_CoinIcon3.svg'
import tokenOne from 'images/CoinIcon1.svg'
import tokenTwo from 'images/CoinIcon2.svg'
import tokenThird from 'images/CoinIcon3.svg'

const getImages = () => ({
  'CoinIcon1.svg': tokenOne,
  'CoinIcon2.svg': tokenTwo,
  'CoinIcon3.svg': tokenThird
})

const getDaiIcons = () => ({
  'CoinIcon1.svg': DAI_1,
  'CoinIcon2.svg': DAI_2,
  'CoinIcon3.svg': DAI_3
})

const CommunityLogo = ({ networkType, metadata: { communityLogo = 'CoinIcon1.svg' }, token: { symbol }, isSmall = false, isBig = false, isDaiToken = false }) => {
  const wrapperClasses = classNames(`logo-circle__outer`,
    { 'logo-circle__outer--normal': !isSmall && !isBig },
    { 'logo-circle__outer--small': isSmall && !isBig },
    { 'logo-circle__outer--big': isBig && !isSmall },
    { [`logo-circle__outer--${communityLogo}`]: true },
    { [`logo-circle__outer--${communityLogo}--${networkType}`]: true }
  )

  return (
    <div className={wrapperClasses}>
      {
        communityLogo
          ? <img src={!isDaiToken ? (getImages()[communityLogo] || tokenOne) : getDaiIcons()[communityLogo]} className='logo-circle__inner' alt='Community Logo' />
          : <Loader color='#fff' className='logo-img' />
      }
      {!isDaiToken && <span className='logo-circle__name'>{symbol}</span>}
    </div>
  )
}

CommunityLogo.propTypes = {
  token: PropTypes.object.isRequired,
  metadata: PropTypes.object
}

export default CommunityLogo
