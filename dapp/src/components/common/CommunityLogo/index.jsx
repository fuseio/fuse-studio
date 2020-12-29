import React from 'react'
import Loader from 'components/common/Loader'
import classNames from 'classnames'
import tokenOne from 'images/CoinIcon1.svg'
import tokenTwo from 'images/CoinIcon2.svg'

const images = {
  'CoinIcon1.svg': tokenOne,
  'CoinIcon2.svg': tokenTwo
}

const CommunityLogo = ({
  metadata,
  symbol,
  imageUrl,
  isSmall,
  isBig = false
}) => {
  const wrapperClasses = classNames('logo-circle__outer',
    { 'logo-circle__outer--normal': !isSmall && !isBig },
    { 'logo-circle__outer--small': isSmall && !isBig },
    { 'logo-circle__outer--big': isBig && !isSmall })

  return (
    <div className={wrapperClasses}>
      {
        imageUrl ? (
          <img
            className='logo-circle__inner'
            alt='Community Logo'
            src={imageUrl}
          />
        ) : (metadata?.communityLogo)
            ? (
              <img
                className='logo-circle__inner'
                alt='Community Logo'
                src={(images[metadata?.communityLogo] ?? tokenOne)}
              />
            ) : <Loader color='#4a687b' className='logo-img' />
      }
      {((metadata?.isDefault) || (metadata?.communityLogo)) && <span className='logo-circle__name'>{symbol}</span>}
    </div>
  )
}

export default CommunityLogo
