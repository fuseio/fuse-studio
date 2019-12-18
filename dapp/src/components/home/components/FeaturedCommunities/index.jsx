import React, { useEffect, memo, useState, useMemo } from 'react'
import { connect } from 'react-redux'
import { fetchFeaturedCommunities } from 'actions/token'
import { withRouter } from 'react-router'
import CommunityPlaceholderImage from 'images/community_placeholder.png'
import isEmpty from 'lodash/isEmpty'
import FeaturedCommunity from 'components/common/FeaturedCommunity'
import { push } from 'connected-react-router'
import Carousel, { Dots } from '@brainhubeu/react-carousel'
import arrow from 'images/arrow_3.svg'

const FeaturedCommunities = memo(({
  communities,
  tokens,
  fetchFeaturedCommunities,
  featuredCommunities,
  push,
  showDashboard
}) => {
  const [value, onChange] = useState(0)

  useEffect(() => {
    fetchFeaturedCommunities()
    return () => { }
  }, [])

  const showCommunities = () => {
    push('/view/communities')
  }

  const slides = useMemo(() => {
    if (!isEmpty(featuredCommunities)) {
      return featuredCommunities.map((address) => {
        const token = tokens[communities[address].foreignTokenAddress]
        const community = communities[address]
        if (token && community) {
          return (
            <div style={{ width: '90%' }} key={address}>
              <FeaturedCommunity
                token={token}
                showDashboard={() => showDashboard(address, community.name)}
                community={community}
              />
            </div>
          )
        }
      })
    } else {
      return [1, 2, 3, 4].map((item) =>
        <div key={item} style={{ width: '90%' }}>
          <img style={{ width: '100%', height: '145px' }} src={CommunityPlaceholderImage} />
        </div>
      )
    }
  }, [featuredCommunities, tokens, communities])

  return (
    <div className='featured__carousel__wrapper'>
      <div className='grid-x align-justify align-middle'>
        <h3 className='featured__carousel__title'>Featured communities</h3>
        <div onClick={showCommunities} className='featured__carousel__action'>
          Explore&nbsp;<img src={arrow} alt='arrow' />
        </div>
      </div>
      <div className='featured__carousel'>
        <Carousel
          value={value}
          centered
          infinite
          draggable
          onChange={onChange}
          animationSpeed={1000}
          slidesPerPage={2}
          breakpoints={{
            1000: {
              slidesPerPage: 2
            },
            800: {
              slidesPerPage: 1
            }
          }}
        >{slides}</Carousel>
        <Dots value={value} onChange={onChange} number={React.Children.count(slides)} />
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  if (prevProps.accountAddress !== nextProps.accountAddress) {
    return false
  } else if (prevProps.communities !== nextProps.communities) {
    return false
  } else if (prevProps.featuredCommunities !== nextProps.featuredCommunities) {
    return false
  }
  return true
})

const mapStateToProps = state => ({
  tokens: state.entities.tokens,
  communities: state.entities.communities,
  featuredCommunities: state.accounts.featuredCommunities
})

const mapDispatchToProps = {
  fetchFeaturedCommunities,
  push
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FeaturedCommunities))
