import React from 'react'
import CommunityLogo from 'components/common/CommunityLogo'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
import { getImageUri } from 'utils/metadata'

const Header = () => {
  const { dashboard } = useStore()
  const { metadata } = dashboard
  return (
    <div className='community_header'>
      <div className='community_header__image'>
        <CommunityLogo
          symbol={dashboard?.homeToken?.symbol}
          imageUrl={getImageUri(metadata)}
          metadata={metadata}
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
