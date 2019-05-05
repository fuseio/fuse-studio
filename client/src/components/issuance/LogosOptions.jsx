import React from 'react'
import { isMobileOnly } from 'react-device-detect'
import classNames from 'classnames'
import CommunityLogo from 'components/elements/CommunityLogo'

const logos = ['CoinIcon1.svg', 'CoinIcon2.svg', 'CoinIcon3.svg']

const LogosOptions = ({ communityLogo, setCommunityLogo, communitySymbol, nextAttribute, networkType }) => {
  const handleClick = (logo, key) => {
    setCommunityLogo({ name: logo, icon: logos[key] })
    if (isMobileOnly) {
      nextAttribute()
    }
  }
  return (
    <div className='attributes__attribute'>
      <h3 className='attributes__title'>
        Community Logo
      </h3>
      <div className='attributes__logos'>
        {
          logos.map((logo, key) => {
            const totalSupplyClass = classNames({
              'attributes__logos__item': true,
              'attributes__logos__item--chosen': communityLogo && communityLogo.icon ? communityLogo.icon === logo : false
            })
            return (
              <div className={totalSupplyClass} key={key} onClick={() => handleClick(logo, key)}>
                <CommunityLogo networkType={networkType} token={{ symbol: communitySymbol }} metadata={{ communityLogo: logos[key] }} />
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default LogosOptions
