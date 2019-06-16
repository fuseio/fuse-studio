import React from 'react'
import CopyToClipboard from 'components/common/CopyToClipboard'
import FontAwesome from 'react-fontawesome'
import { isMobileOnly } from 'react-device-detect'
import CommunityLogo from 'components/common/CommunityLogo'
import { formatAddress } from 'utils/format'
import { isDaiToken } from 'constants/existingTokens'

export default ({ tokenAddress, isClosed, name, networkType, token, metadata }) => {
  return (
    <div className='community_header'>
      <div className='community_header__image'>
        <CommunityLogo
          isDaiToken={isDaiToken(networkType, token)}
          networkType={networkType}
          token={token}
          isSmall={isMobileOnly}
          metadata={metadata}
        />
      </div>
      <div className='community_header__content'>
        <div className='name__wrapper'>
          <h2 className='name'>{name}</h2>
          &nbsp;&nbsp;<span className='name__line' />&nbsp;&nbsp;
          <span className='name__status'>{isClosed ? 'Close' : 'Open'} community</span>
        </div>
        <div className='address'>
          {isMobileOnly
            ? <span>{formatAddress(tokenAddress)}</span>
            : <span>{tokenAddress}</span>
          }
          <CopyToClipboard text={tokenAddress}>
            <FontAwesome name='clone' />
          </CopyToClipboard>
        </div>
      </div>
    </div>
  )
}
