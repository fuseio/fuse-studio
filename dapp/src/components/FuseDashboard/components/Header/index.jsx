import React from 'react'
import CommunityLogo from 'components/common/CommunityLogo'
import PlusIcon from 'images/plus.svg'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
import { getImageUri } from 'utils/metadata'
import { useDispatch, useSelector } from 'react-redux'

const Header = () => {
  const { dashboard } = useStore()
  const communityURI = dashboard?.community?.communityURI
  const communityMetadata = useSelector(state => state.entities.metadata[communityURI])

  return (
    <div className='community_header'>
      <div className='community_header__image'>
        <CommunityLogo
          symbol={dashboard?.homeToken?.symbol}
          imageUrl={getImageUri(communityMetadata)}
          metadata={communityMetadata}
        />
      </div>
      <div className='community_header__content'>
        <div className='name__wrapper'>
          <h2 className='name'>{dashboard?.community?.name} community</h2>
        </div>
      </div>
    </div>
  )
}

export default observer(Header)
