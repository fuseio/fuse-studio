import React, { memo } from 'react'
import PropTypes from 'prop-types'
import identity from 'lodash/identity'
// import { formatWei } from 'utils/format'
import CommunityLogo from 'components/common/CommunityLogo'
// import { isDaiToken } from 'constants/existingTokens'
import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'

const Community = memo(({
  token = {},
  showDashboard = identity,
  networkType,
  metadata = {}
}) => {
  const {
    name,
    symbol,
    // totalSupply,
    communityAddress
  } = token

  const handleClick = () => {
    if (communityAddress) {
      showDashboard(communityAddress)
    }
  }

  return (
    <div className='community' onClick={handleClick}>
      <div className='community__logo'>
        <CommunityLogo
          // isDaiToken={isDaiToken(networkType, token)}
          symbol={symbol}
          imageUrl={!isEmpty(get(metadata, 'image')) ? `${CONFIG.ipfsProxy.urlBase}/image/${get(metadata, 'image')}` : null}
          metadata={metadata}
        />
      </div>
      <div className='community__content'>
        <h3 className='community__content__title'>{name}</h3>
        {/* <p className='community__content__members'>
          Total Supply
          <span>{formatWei(totalSupply, 0)}</span>
        </p> */}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  if (prevProps.token !== nextProps.token) {
    return false
  } else if (prevProps.metadata !== nextProps.metadata) {
    return false
  }

  return true
})

Community.propTypes = {
  token: PropTypes.object,
  metadata: PropTypes.object
}

export default Community
