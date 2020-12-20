import React from 'react'
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
        ) : (metadata && metadata.communityLogo)
          ? (
            <img
              className='logo-circle__inner'
              alt='Community Logo'
              src={((getImages()[(metadata && metadata.communityLogo)] || tokenOne) ||
                 getDaiIcons()[(metadata && metadata.communityLogo)])}
            />
          ) : <Loader color='#4a687b' className='logo-img' />
      }
      {((metadata && metadata.isDefault) || (metadata && metadata.communityLogo)) && <span className='logo-circle__name'>{symbol}</span>}
    </div>
  )
}

export default CommunityLogo
