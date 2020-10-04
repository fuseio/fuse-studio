import React, { memo } from 'react'
import PropTypes from 'prop-types'
import identity from 'lodash/identity'
import CommunityLogo from 'components/common/CommunityLogo'
import { getImageUri } from 'utils/metadata'

const Community = memo(({
  token = {},
  showDashboard = identity,
  metadata = {}
}) => {
  const {
    name,
    symbol,
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
          symbol={symbol}
          imageUrl={getImageUri(metadata)}
          metadata={metadata}
        />
      </div>
      <div className='community__content'>
        <h3 className='community__content__title'>{name}</h3>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  if ((prevProps.metadata !== nextProps.metadata) || (prevProps.token !== nextProps.token)) {
    return false
  }

  return true
})

Community.propTypes = {
  token: PropTypes.object,
  metadata: PropTypes.object
}

export default Community
