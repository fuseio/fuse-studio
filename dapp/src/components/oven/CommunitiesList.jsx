import React from 'react'
import { isMobileOnly } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroller'
import groupImage from 'images/all-communities.png'
import groupImageMobile from 'images/all-communities-mobile.png'
import FeaturedCommunity from 'components/common/FeaturedCommunity'

const PAGE_START = 1

export default ({
  tokens,
  hasMore,
  addresses,
  showDashboard,
  getScrollParent,
  communities
}) => {
  // useEffect(() => {
  // fetchTokens(networkType, PAGE_START)
  //   return () => { }
  // }, [])

  const loadMore = (nextPage) => {
    // fetchTokens(networkType, nextPage)
  }

  return (
    <>
      <div className='communities__wrapper'>
        <div className='grid-container communities__banner grid-x grid-padding-x grid-padding-y align-middle'>
          <div className='communities__banner__content cell medium-14 large-10' style={{ height: '50%' }}>
            <h2 className='communities__banner__title'>Welcome to<br />Fuse economies</h2>
            <p className='communities__banner__text'>
              Explore the countless different micro-economies around the world utilizing Fuse network
            </p>
          </div>
          <div className='communities__banner__image communities__banner__image--second cell medium-10 small-20'>
            <img src={!isMobileOnly ? groupImage : groupImageMobile} />
          </div>
        </div>
      </div>
      <div className='communities__list__wrapper'>
        <div className='grid-container communities__list'>
          <div className='grid-y'>
            <div className='grid-x grid-padding-x grid-padding-y communities__search__wrapper'>
              <div className='cell small-24'>
                {/* <div className='communities__search'>
                  <button className='communities__search__icon'>
                    <span aria-hidden='true' className='fa fa-search' />
                  </button>
                  <input placeholder='Search community…' />
                </div> */}
              </div>
            </div>
            <InfiniteScroll
              className='grid-x grid-padding-x grid-margin-y communities__list__items'
              initialLoad={false}
              pageStart={PAGE_START}
              loadMore={loadMore}
              hasMore={hasMore}
              getScrollParent={getScrollParent}
            >
              {
                addresses.map((address) => {
                  const token = tokens[communities[address].foreignTokenAddress]
                  const community = communities[address]
                  const useOld = community?.isMultiBridge || (community?.foreignBridgeAddress && community?.homeBridgeAddress)
                  if (community) {
                    return (
                      <div className='medium-12 large-8 small-24 cell' key={address}>
                        <FeaturedCommunity
                          token={token}
                          showDashboard={() => showDashboard(address, community.name, useOld)}
                          community={community}
                        />
                      </div>
                    )
                  }
                })
              }
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </>
  )
}
