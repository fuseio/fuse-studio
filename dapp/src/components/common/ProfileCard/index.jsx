import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'
import ArrowTiny from 'images/arrow_tiny.svg'

import { fetchToken } from 'actions/token'
import { fetchMetadata } from 'actions/metadata'
import { balanceOfToken } from 'actions/accounts'

import CommunityLogo from 'components/common/CommunityLogo'

const ProfileCard = ({
  entity,
  metadata,
  balance,
  fetchMetadata,
  fetchToken,
  balanceOfToken,
  showDashboard,
  accountAddress
}) => {
  const { token, community } = entity
  const { name, symbol } = token
  const { communityURI, homeTokenAddress, foreignTokenAddress, communityAddress } = community

  useEffect(() => {
    balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })
    balanceOfToken(foreignTokenAddress, accountAddress, { bridgeType: 'foreign' })
    fetchMetadata(communityURI)
    fetchToken(homeTokenAddress)
    fetchToken(foreignTokenAddress)
    return () => { }
  }, [])

  return (
    <div className='profile__card grid-x cell align-middle' onClick={() => showDashboard(communityAddress)}>
      <div className='profile__card__logo'>
        <CommunityLogo
          symbol={symbol}
          imageUrl={!isEmpty(get(metadata, 'image')) ? `${CONFIG.ipfsProxy.urlBase}/image/${get(metadata, 'image')}` : null}
          isSmall
          metadata={metadata}
        />
      </div>
      <div className='cell auto grid-y profile__card__content'>
        <h5 className='profile__card__title'>{name}</h5>
        <p className='profile__card__balance'>
          <span>Balance:&nbsp;</span>
          <span>{balance}&nbsp;</span>
          <span>{symbol}</span>
        </p>
      </div>
      <div className='profile__card__arrow'>
        <img src={ArrowTiny} />
      </div>
    </div>
  )
}

export default connect(null, {
  fetchMetadata,
  fetchToken,
  balanceOfToken
})(ProfileCard)
