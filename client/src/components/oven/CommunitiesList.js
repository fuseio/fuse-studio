import React, { Component } from 'react'
import Community from 'components/Community'
import InfiniteScroll from 'react-infinite-scroller'
import Banner from 'images/home-banner.png'

const PAGE_START = 1
const PAGE_SIZE = 10

class CommunitiesList extends Component {
  constructor (props) {
    super(props)
    this.myRef = React.createRef()
  }

  loadMore = (nextPage) => {
    this.props.fetchTokens(nextPage)
  }

  componentDidMount () {
    if (this.props.addresses.length < PAGE_SIZE) {
      this.props.fetchTokens(PAGE_START)
    }
  }

  getScrollParent = () => this.myRef.current

  render () {
    const {addresses, tokens, metadata} = this.props
    return <div className='communities-list' ref={this.myRef}>
      <div className='communities-banner' style={{backgroundImage: `url(${Banner})`}}>
        <div className='communities-banner-content' >
          <h2 className='communities-banner-title'>
            Launch your community on <span>Fuse</span>
          </h2>
          <p className='communities-banner-text'>
            Fuse is intended for community currencies operated by companies and entrepreneurs. It streamlines the process of launching your community currency and provide battle-tested and customizable tools to get it off the ground
          </p>
        </div>
      </div>
      <div className='communities-list-container'>
        <div className='communities-list-content'>
          <h2 className='communities-list-title'>All communities</h2>
          <div className='communities-list-search'>
            <input placeholder='Search community…' />
            <button className='search-btn'>
              <span aria-hidden='true' className='fa fa-search' />
            </button>
          </div>
        </div>
        <InfiniteScroll
          initialLoad={false}
          pageStart={PAGE_START}
          loadMore={this.loadMore}
          hasMore={this.props.hasMore}
          useWindow={false}
          getScrollParent={this.getScrollParent}
        >
          {addresses.map(address =>
            <div className='list-item' key={address}>
              <Community
                token={tokens[address]}
                metadata={metadata[tokens[address].tokenURI]}
                history={this.props.history}
                account={this.props.account}
                showDashboard={this.props.showDashboard}
              />
            </div>
          )}
        </InfiniteScroll>
      </div>
    </div>
  }
};

export default CommunitiesList
