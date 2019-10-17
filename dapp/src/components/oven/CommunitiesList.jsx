import React, { useEffect } from 'react'
import { isMobileOnly } from 'react-device-detect'
// import Community from 'components/common/Community'
import InfiniteScroll from 'react-infinite-scroller'
import groupImage from 'images/all-communities.png'
import groupImageMobile from 'images/all-communities-mobile.png'
import FeaturedCommunity from 'components/common/FeaturedCommunity'

const PAGE_START = 1

export default ({
  tokens,
  account,
  hasMore,
  history,
  metadata,
  addresses,
  fetchTokens,
  networkType,
  showDashboard,
  getScrollParent,
  communities
}) => {
  useEffect(() => {
    // fetchTokens(networkType, PAGE_START)
    return () => { }
  }, [])

  const loadMore = (nextPage) => {
    // fetchTokens(networkType, nextPage)
  }

  return (
    <React.Fragment>
      <div className='communities__wrapper'>
        <div className='grid-container communities__banner grid-x grid-padding-x grid-padding-y'>
          <div className='communities__banner__content cell medium-14 large-10' style={{ height: '50%' }}>
            <h2 className='communities__banner__title'>Welcome to<br />Fuse communities</h2>
            <p className='communities__banner__text communities__banner__text--space'>
              Fuse is intended for community currencies operated by companies and entrepreneurs.
            </p>
            <p className='communities__banner__text'>
              It streamlines the process of launching your community currency and provide battle-tested and customizable tools to get it off the ground
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
                <div className='communities__search'>
                  <button className='communities__search__icon'>
                    <span aria-hidden='true' className='fa fa-search' />
                  </button>
                  <input placeholder='Search community…' />
                </div>
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
                addresses.map((address, index) => {
                  const token = tokens[communities[address].foreignTokenAddress]
                  const community = communities[address]
                  if (token && community) {
                    return (
                      <div className='medium-12 large-8 small-24 cell' key={address}>
                        <FeaturedCommunity
                          metadata={metadata[token.tokenURI]}
                          showDashboard={() => showDashboard(address)}
                          community={community}
                        />
                      </div>
                    )
                  }
                })
              }
              {/* {addresses.map(address =>
                <div className='medium-12 large-8 small-24 cell' key={address}>
                  <Community
                    networkType={networkType}
                    token={tokens[address]}
                    metadata={metadata[tokens[address].tokenURI]}
                    history={history}
                    account={account}
                    showDashboard={showDashboard}
                  />
                </div>
              )} */}
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
