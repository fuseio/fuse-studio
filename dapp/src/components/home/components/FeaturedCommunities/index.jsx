import React, { useState, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { useDispatch, useSelector } from 'react-redux'
import CommunityPlaceholderImage from 'images/community_placeholder.png'
import isEmpty from 'lodash/isEmpty'
import FeaturedCommunity from 'components/common/FeaturedCommunity'
import { push } from 'connected-react-router'
import Carousel, { Dots } from '@brainhubeu/react-carousel'
import arrow from 'images/arrow_3.svg'

const FeaturedCommunities = ({
  showDashboard
}) => {
  const dispatch = useDispatch()
  const communities = useSelector(state => state.entities.communities)
  const tokens = useSelector(state => state.entities.tokens)
  const featuredCommunities = useSelector(state => state.accounts.featuredCommunities)
  const [value, onChange] = useState(0)

  const showCommunities = () => {
    dispatch(push('/view/communities'))
  }

  const slides = useMemo(() => {
    if (!isEmpty(featuredCommunities)) {
      return featuredCommunities.map((address) => {
        const token = tokens[communities[address].foreignTokenAddress]
        const community = communities[address]
        return (
          <div style={{ width: '90%' }} key={address}>
            <FeaturedCommunity
              token={token}
              showDashboard={() => showDashboard(address, community.name, token)}
              community={community}
              withDescription
            />
          </div>
        )
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
        <h3 className='featured__carousel__title'>Featured economies</h3>
        <div onClick={showCommunities} className='featured__carousel__action'>
          Explore&nbsp;<img src={arrow} alt='arrow' />
        </div>
      </div>
      <div className='featured__carousel'>
        <Carousel
          value={value}
          centered
          infinite
          draggable={isMobile}
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
        >
          {slides}
        </Carousel>
        {slides && slides.length > 1 && <Dots value={value} onChange={onChange} number={React.Children.count(slides)} />}
      </div>
    </div>
  )
}

FeaturedCommunities.displayName = 'FeaturedCommunities'

export default FeaturedCommunities
