import React from 'react'
import PropTypes from 'prop-types'
import Loader from 'components/common/Loader'
import classNames from 'classnames'
import DAI_1 from 'images/DAI_CoinIcon1.svg'
import DAI_2 from 'images/DAI_CoinIcon2.svg'
import tokenOne from 'images/CoinIcon1.svg'
import tokenTwo from 'images/CoinIcon2.svg'

const getImages = () => ({
  'CoinIcon1.svg': tokenOne,
  'CoinIcon2.svg': tokenTwo
})

const getDaiIcons = () => ({
  'CoinIcon1.svg': DAI_1,
  'CoinIcon2.svg': DAI_2
})

const CommunityLogo = ({
  metadata: { communityLogo, isDefault } = { communityLogo: 'CoinIcon1.svg', isDefault: false },
  token: { symbol },
  imageUrl,
  isSmall = false,
  isBig = false,
  isDaiToken = false
}) => {
  const wrapperClasses = classNames(`logo-circle__outer`,
    { 'logo-circle__outer--normal': !isSmall && !isBig },
    { 'logo-circle__outer--small': isSmall && !isBig },
    { 'logo-circle__outer--big': isBig && !isSmall })

  return (
    <div className={wrapperClasses}>
      {
        imageUrl || communityLogo
          ? <img
            className='logo-circle__inner'
            alt='Community Logo'
            src={imageUrl || (!isDaiToken
              ? (getImages()[communityLogo] || tokenOne)
              : getDaiIcons()[communityLogo])}
          />
          : <Loader color='#fff' className='logo-img' />
      }
      {!isDaiToken && isDefault && imageUrl && <span className='logo-circle__name'>{symbol}</span>}
    </div>
  )
}

CommunityLogo.propTypes = {
  token: PropTypes.object.isRequired,
  metadata: PropTypes.object
}

export default CommunityLogo
