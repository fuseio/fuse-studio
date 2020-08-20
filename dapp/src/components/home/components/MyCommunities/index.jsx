import React, { useState } from 'react'
import PlusIcon from 'images/add.svg'
import { connect } from 'react-redux'
import classNames from 'classnames'
import Carousel, { Dots } from '@brainhubeu/react-carousel'
import isEmpty from 'lodash/isEmpty'
import FeaturedCommunity from 'components/common/FeaturedCommunity'
import { getCommunitiesKeys } from 'selectors/accounts'

const toMatrix = (arr, width) =>
  arr.reduce((rows, key, index) => (index % width === 0 ? rows.push([key])
    : rows[rows.length - 1].push(key)) && rows, [])

const Empty = () => {
  return (
    <div className='cell medium-12 small-24'>
      <div style={{ backgroundColor: '#f3f3f3', borderRadius: '8px', width: '100%', height: '100%', minHeight: '144px', minWidth: '240px' }} />
    </div>
  )
}

const NoCommunities = ({ showIssuance }) => {
  return (
    <div className='cell medium-12 small-24' onClick={showIssuance}>
      <div className='no_communities'>
        <div className='content'>
          <div className='empty'>You have no communities yet</div>
          <div className='title'>Click here to create your first one!</div>
          <img src={PlusIcon} />
        </div>
      </div>
    </div>
  )
}

const MyCommunities = ({
  showIssuance,
  title = 'My communities',
  withDecoration = false,
  communitiesKeys,
  communities,
  showDashboard
}) => {
  const [valueSpinner, onChangeSpinner] = useState(0)

  const communitiesIOwn = React.useMemo(() => {
    return communitiesKeys
      .map((communityAddress) => communities[communityAddress])
      .filter(obj => !!obj).filter(({ isAdmin, token }) => isAdmin && token)
  }, [communitiesKeys, communities])

  const slides = React.useMemo(() => {
    if (!isEmpty(communitiesIOwn)) {
      const myCommunities = communitiesIOwn.map((community) => {
        const { token } = community
        const { communityAddress } = community

        return (
          <div className='cell medium-12 small-24' key={communityAddress}>
            <FeaturedCommunity
              token={token}
              showDashboard={() => showDashboard(communityAddress)}
              community={community}
            />
          </div>
        )
      })
      const myCommunitiesList = toMatrix(myCommunities, 4).map((items, index) => (
        <div style={{ width: '100%' }} key={index} className='grid-x grid-margin-x grid-margin-y'>
          {items}
        </div>
      ))
      return myCommunitiesList
    } else {
      return [
        <div key={'NoCommunities'} style={{ width: '100%', height: '100%' }} className='grid-x grid-margin-x grid-margin-y'>
          <NoCommunities showIssuance={showIssuance} />
          <Empty />
          <Empty />
          <Empty />
        </div>
      ]
    }
  }, [communitiesIOwn])
  return (
    <div className={classNames('my_communities', { 'my_communities__decoration': withDecoration })}>
      {withDecoration && <div className='my_communities__title'>{title}</div>}
      <Carousel
        value={valueSpinner}
        centered
        infinite={slides && slides.length > 1}
        draggable
        onChange={onChangeSpinner}
        animationSpeed={1000}
        slidesPerPage={1}
        breakpoints={{
          1000: {
            slidesPerPage: 2
          },
          800: {
            slidesPerPage: 1
          }
        }}
      >
        {slides}
      </Carousel>
      {slides && slides.length > 1 && <Dots value={valueSpinner} onChange={onChangeSpinner} number={slides && slides.length} />}
    </div>
  )
}

const mapStateToProps = (state) => ({
  communities: state.entities.communities,
  communitiesKeys: getCommunitiesKeys(state)
})

export default connect(mapStateToProps, null)(MyCommunities)
