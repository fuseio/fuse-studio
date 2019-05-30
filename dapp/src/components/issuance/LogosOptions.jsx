import React from 'react'
import { isMobileOnly } from 'react-device-detect'
import classNames from 'classnames'
import CommunityLogo from 'components/elements/CommunityLogo'
import Carousel from 'components/common/Carousel'

const logos = ['CoinIcon1.svg', 'CoinIcon2.svg', 'CoinIcon3.svg']

const LogosOptions = ({ communityType, communityLogo, setCommunityLogo, communitySymbol, nextAttribute, networkType }) => {
  const handleClick = (logo, key) => {
    setCommunityLogo({ name: logo, icon: logos[key] })
  }

  let items
  if (communityType && communityType.value !== 'existingToken') {
    items = logos.map((logo, key) => {
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
  } else {
    items = logos.map((logo, key) => {
      const totalSupplyClass = classNames({
        'attributes__logos__item': true,
        'attributes__logos__item--chosen': communityLogo && communityLogo.icon ? communityLogo.icon === logo : false
      })

      return (
        <div className={totalSupplyClass} key={key} onClick={() => handleClick(logo, key)}>
          <CommunityLogo isDaiToken networkType={networkType} token={{ symbol: communitySymbol }} metadata={{ communityLogo: logos[key] }} />
        </div>
      )
    })
  }

  return (
    <div className='attributes__attribute'>
      <h3 className='attributes__title'>
        Community Logo
      </h3>
      <div className='attributes__logos'>
        {
          isMobileOnly ? (
            <Carousel>
              { items }
            </Carousel>
          ) : (
            items
          )
        }
      </div>
    </div>
  )
}

export default LogosOptions
