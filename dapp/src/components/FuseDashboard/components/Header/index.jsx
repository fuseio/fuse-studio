import React from 'react'
import CommunityLogo from 'components/common/CommunityLogo'
import PlusIcon from 'images/plus.svg'
import { observer, inject } from 'mobx-react'
import { useStore } from 'mobxStore'
import { getImageUri } from 'utils/metadata'

const Header = ({ dashboard, metadata, handleJoinCommunity }) => {
  console.log({ Header: dashboard })
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
      {/* {
        handleJoinCommunity
          ? <div className='community_header__button'>
            <button onClick={handleJoinCommunity}><img src={PlusIcon} />Join community</button>
          </div>
          : null
      } */}
    </div>
  )
}

export default inject('dashboard')(observer(Header))
