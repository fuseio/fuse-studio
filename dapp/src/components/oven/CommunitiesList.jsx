import React, { Component } from 'react'
import Community from 'components/common/Community'
import InfiniteScroll from 'react-infinite-scroller'
import ReactGA from 'services/ga'
import groupImage from 'images/all-communities.png'
import groupImageMobile from 'images/all-communities-mobile.png'
import NavBar from 'components/common/NavBar'
import { isMobileOnly } from 'react-device-detect'

const PAGE_START = 1
const PAGE_SIZE = 10

class CommunitiesList extends Component {
  constructor (props) {
    super(props)
    this.myRef = React.createRef()
  }

  loadMore = (nextPage) => {
    const { networkType, fetchTokens } = this.props
    fetchTokens(networkType, nextPage)
  }

  showIssuance = () => {
    this.props.history.push('/view/issuance')
    ReactGA.event({
      category: 'Top Bar',
      action: 'Click',
      label: 'issuance'
    })
  }

  componentDidMount () {
    if (this.props.addresses.length < PAGE_SIZE) {
      const { networkType, fetchTokens } = this.props
      fetchTokens(networkType, PAGE_START)
    }
  }

  getScrollParent = () => this.myRef.current

  render () {
    const { showDashboard, account, hasMore, history, addresses, tokens, metadata, networkType } = this.props
    return (
      <div className='communities' ref={this.myRef}>
        <NavBar />
        <div className='communities__wrapper'>
          <div className='grid-container communities__banner grid-x grid-padding-x grid-padding-y'>
            <div className='communities__banner__content cell medium-14 large-8' style={{ height: '50%' }}>
              <h2 className='communities__banner__title'>Welcome to<br />Fuse communities</h2>
              <p className='communities__banner__text communities__banner__text--space'>
                Fuse is intended for community currencies operated by companies and entrepreneurs.
              </p>
              <p className='communities__banner__text'>
                It streamlines the process of launching your community currency and provide battle-tested and customizable tools to get it off the ground
              </p>
            </div>
            <div className='communities__banner__image communities__banner__image--second cell medium-10 small-15'>
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
                loadMore={this.loadMore}
                hasMore={hasMore}
                useWindow={false}
                getScrollParent={this.getScrollParent}
              >
                {addresses.map(address =>
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
                )}
              </InfiniteScroll>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default CommunitiesList
