import React, { Component } from 'react'
import ExpandableCommunity from 'components/oven/ExpandableCommunity'
import InfiniteScroll from 'react-infinite-scroller'

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
    this.props.fetchCommunities(nextPage)
  }

  componentDidMount () {
    if (this.props.addresses.length < PAGE_SIZE) {
      this.props.fetchCommunities(PAGE_START)
    }
  }

  getScrollParent = () => this.myRef.current

  render () {
    const {addresses} = this.props
    return <div className='communities-list' ref={this.myRef}>
      <h2 className='communities-list-title'>Communities</h2>
      <div className='communities-list-container'>
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
            token={this.props.tokens[address]}
            usdPrice={this.props.fiat.USD && this.props.fiat.USD.price}
            marketMaker={this.props.marketMaker[address]}
            selectedCommunityAddress={this.state.selectedCommunityAddress}
          />
          )}
        </InfiniteScroll>
      </div>
    </div>
  }
};

export default CommunitiesList
