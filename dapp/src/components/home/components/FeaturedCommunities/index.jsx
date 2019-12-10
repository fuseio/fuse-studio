import React, { useEffect, memo, useState } from 'react'
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
  metadata,
  accountAddress,
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

  const slides = React.useMemo(() => {
    if (!isEmpty(featuredCommunities)) {
      return featuredCommunities.map((address) => {
        const token = tokens[communities[address].foreignTokenAddress]
        const community = communities[address]
        if (token && community) {
          return (
            <div style={{ width: '90%' }} key={address}>
              <FeaturedCommunity
                accountAddress={accountAddress}
                metadata={{
                  ...metadata[token.tokenURI],
                  ...metadata[community.communityURI]
                }}
                symbol={token && token.symbol}
                showDashboard={() => showDashboard(address, community.name)}
                community={community}
              />
            </div>
          )
        }
      })
    } else {
      return [1, 2, 3, 4].map((item) =>
        <div key={item} className='cell medium-12 small-24'>
          <img style={{ width: '100%', height: '145px' }} src={CommunityPlaceholderImage} />
        </div>
      )
    }
  }, [featuredCommunities, tokens, communities])

  return (
    <div className='featured__carousel__wrapper'>
      <h3 className='featured__carousel__title'>Featured communities</h3>
      <div className='featured__carousel'>
        <Carousel
          value={value}
          centered
          infinite
          draggable
          autoPlay={2000}
          animationSpeed={1000}
          slidesPerPage={2}
        >{slides}</Carousel>
        <Dots value={value} onChange={onChange} number={4} />
      </div>
      <div onClick={showCommunities} className='faq__action'>
        Explore&nbsp;<img src={arrow} alt='arrow' />
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  if (prevProps.accountAddress !== nextProps.accountAddress) {
    return false
  } else if (prevProps.communities !== nextProps.communities) {
    return false
  } else if (prevProps.metadata !== nextProps.metadata) {
    return false
  } else if (prevProps.featuredCommunities !== nextProps.featuredCommunities) {
    return false
  }
  return true
})

const mapStateToProps = state => ({
  tokens: state.entities.tokens,
  metadata: state.entities.metadata,
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
