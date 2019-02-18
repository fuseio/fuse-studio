import React, { Component } from 'react'
import ExpandableCommunity from 'components/oven/ExpandableCommunity'
import InfiniteScroll from 'react-infinite-scroller'
import Banner from 'images/home-banner.png'

const PAGE_START = 1
const PAGE_SIZE = 10

class CommunitiesList extends Component {
  state = {
    selectedCommunityAddress: null
  }

  constructor (props) {
    super(props)
    this.myRef = React.createRef()
  }

  handleCommunityClick = (address) => {
    this.setState({
      selectedCommunityAddress: address
    })
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
            A cool headline about <span>fuse</span>
          </h2>
          <p className='communities-banner-text'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sodales ut lacus pretium imperdiet. Aenean sit amet dolor et mi lobortis euismod.
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
          {addresses.map(address => <ExpandableCommunity
            key={address}
            handleCommunityClick={this.handleCommunityClick}
            token={tokens[address]}
            metadata={metadata[tokens[address].tokenURI]}
            selectedCommunityAddress={this.state.selectedCommunityAddress}
            account={this.props.account}
          />
          )}
        </InfiniteScroll>
      </div>
    </div>
  }
};

export default CommunitiesList
