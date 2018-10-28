import React from 'react'
import { connect } from 'react-redux'
import {fetchCommunities} from 'actions/communities'

const style = {
  top: 60,
  position: 'absolute',
  background: 'white'
}

const Community = ({community}) => (
  <div>
    <pre>
      {
        JSON.stringify(community)
      }
    </pre>
  </div>
)

class Oven extends React.Component {
  state = {
    currentPage: 2
  }

  componentDidMount () {
    setTimeout(() => this.props.fetchCommunities(this.state.currentPage), 3000)
  }

  handleLoadMore = () => {
    const nextPage = this.state.currentPage + 1
    this.props.fetchCommunities(nextPage)
    this.setState({currentPage: nextPage})
  }

  render = () => {
    const {addresses, communities, loadMore} = this.props
    return (
      <div style={style}>
        <div>
          {
            addresses.map(address =>
              communities[address] && <Community key={address} community={communities[address]} />
            )
          }
        </div>
        {loadMore && <button onClick={this.handleLoadMore}>Load more</button>}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  communities: state.tokens,
  ...state.screens.oven
})

const mapDispatchToProps = {
  fetchCommunities
}

export default connect(mapStateToProps, mapDispatchToProps)(Oven)
