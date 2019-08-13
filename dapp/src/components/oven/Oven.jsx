import React, { Component } from 'react'
import CommunitiesList from 'components/oven/CommunitiesList'
import { connect } from 'react-redux'
import { fetchTokens, fetchTokensByOwner, fetchFuseToken } from 'actions/token'
import { loadModal } from 'actions/ui'
import { getAccountAddress } from 'selectors/accounts'
import { getForeignNetwork } from 'selectors/network'
import ReactGA from 'services/ga'
import NavBar from 'components/common/NavBar'

class Oven extends Component {
  constructor (props) {
    super(props)

    this.myRef = React.createRef()
  }
  componentDidMount () {
    if (this.props.networkType !== 'fuse') {
      this.props.fetchFuseToken()
    }
    if (this.props.account) {
      const { networkType } = this.props
      this.props.fetchTokensByOwner(networkType, this.props.account)
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.account && !prevProps.account) {
      const { networkType } = this.props
      this.props.fetchTokensByOwner(networkType, this.props.account)
    }
  }

  showDashboard = (communityAddress) => {
    this.props.history.push(`/view/community/${communityAddress}`)
    ReactGA.event({
      category: 'Dashboard',
      action: 'Click',
      label: 'dashboard'
    })
  }

  getScrollParent = () => this.myRef.current

  render = () => (
    <div className='communities' ref={this.myRef}>
      <NavBar />
      <CommunitiesList getScrollParent={this.getScrollParent} {...this.props} showDashboard={this.showDashboard} />
    </div>
  )
}

const mapStateToProps = state => ({
  tokens: state.entities.tokens,
  metadata: state.entities.metadata,
  account: getAccountAddress(state),
  foreignNetwork: getForeignNetwork(state),
  networkType: state.network.networkType,
  ...state.screens.oven
})

const mapDispatchToProps = {
  fetchTokens,
  fetchTokensByOwner,
  loadModal,
  fetchFuseToken

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Oven)
