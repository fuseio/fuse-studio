import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { push } from 'connected-react-router'
import CommunityLogo from 'components/common/CommunityLogo'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
import { getImageUri } from 'utils/metadata'
import PlusIcon from 'images/plus.svg'

function Header () {
  const dispatch = useDispatch()
  const pathname = useSelector(state => state.router.location.pathname)
  const { dashboard } = useStore()
  const { metadata } = dashboard

  const handleJoinCommunity = () => {
    dispatch(push(`${pathname}/users/join`))
  }

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
      {
        !dashboard?.isCommunityMember && (
          <div className='community_header__button'>
            <button onClick={handleJoinCommunity}><img src={PlusIcon} />Join community</button>
          </div>
        )
      }
    </div>
  )
}

export default observer(Header)
