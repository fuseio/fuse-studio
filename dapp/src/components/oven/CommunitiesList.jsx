import React, { Component } from 'react'
import Community from 'components/Community'
import InfiniteScroll from 'react-infinite-scroller'
import Banner from 'images/illus.png'
import ReactGA from 'services/ga'

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
      <div className={`communities-list ${this.props.networkType}`} ref={this.myRef}>
        <div className='grid-container full communities-banner-wrapper'>
          <div className='communities-banner grid-container' >
            <div className='communities-banner-content grid-x grid-padding-x' >
              <h2 className='communities-banner-title cell'>
                Launch your<br /> community on Fuse
              </h2>
              <p className='communities-banner-text cell'>
                Fuse is intended for community currencies operated by companies and entrepreneurs. It streamlines the process of launching your community currency and provide battle-tested and customizable tools to get it off the ground
              </p>
            </div>
            <div className='communities-banner-img'>
              <img src={Banner} />
            </div>
          </div>
        </div>
        <div className='grid-container'>
          <div className='grid-y'>
            <div className='grid-x grid-padding-x grid-padding-y communities-list-content'>
              <h2 className='communities-list-title cell auto'>All communities</h2>
              <div className='cell large-8'>
                <div className='communities-list-search'>
                  <input placeholder='Search community…' />
                  <button className='search-btn'>
                    <span aria-hidden='true' className='fa fa-search' />
                  </button>
                </div>
              </div>
            </div>
            <InfiniteScroll
              className='grid-x grid-padding-x grid-margin-y'
              initialLoad={false}
              pageStart={PAGE_START}
              loadMore={this.loadMore}
              hasMore={hasMore}
              useWindow={false}
              getScrollParent={this.getScrollParent}
            >
              {addresses.map(address =>
                <div className='medium-12 large-8 small-24 list-item' key={address}>
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
    )
  }
}

export default CommunitiesList
