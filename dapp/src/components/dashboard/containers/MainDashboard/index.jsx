import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import SidebarContent from '../../components/Sidebar'
import Dashboard from '../../pages/Dashboard'
import WhiteLabelWallet from '../../pages/WhiteLabelWallet'
import { fetchCommunity, fetchTokenProgress, fetchToken } from 'actions/token'
import { isUserExists } from 'actions/user'
import { loadModal, hideModal } from 'actions/ui'
import { Route, Switch } from 'react-router-dom'
import Users from '../../pages/Users'
import Businesses from '../../pages/Businesses'
import Header from '../../components/Header'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import Sidebar from 'react-sidebar'
import { isMobile } from 'react-device-detect'
import FontAwesome from 'react-fontawesome'
import { getForeignNetwork } from 'selectors/network'
import NavBar from 'components/common/NavBar'
import { getAccountAddress } from 'selectors/accounts'
import { checkIsAdmin } from 'selectors/entities'
import { fetchEntities } from 'actions/communityEntities'
import SignIn from 'components/common/SignIn'

class DashboardLayout extends PureComponent {
  state = {
    open: false
  }

  componentDidMount () {
    if (!this.props.token) {
      this.props.fetchCommunity(this.props.communityAddress)
      this.props.fetchTokenProgress(this.props.communityAddress)
      this.props.fetchEntities(this.props.communityAddress)
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.onSetSidebarOpen(false)
    }

    if (this.props.match.params.address !== prevProps.match.params.address) {
      this.props.fetchCommunity(this.props.communityAddress)
      this.props.fetchTokenProgress(this.props.communityAddress)
      this.props.fetchEntities(this.props.communityAddress)
    }

    if ((this.props.community && this.props.community.foreignTokenAddress) && !prevProps.community) {
      const { fetchToken, community: { foreignTokenAddress } } = this.props
      fetchToken(foreignTokenAddress)
    }

    if (prevProps.community && ((this.props.community && this.props.community.foreignTokenAddress) !== (prevProps.community && prevProps.community.foreignTokenAddress))) {
      const { fetchToken, community: { foreignTokenAddress } } = this.props
      fetchToken(foreignTokenAddress)
    }
  }

  onlyOnFuse = (successFunc) => {
    const { networkType } = this.props
    if (networkType === 'fuse') {
      successFunc()
    } else {
      const { loadModal } = this.props
      loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: ['fuse'] })
    }
  }

  onSetSidebarOpen = open => this.setState({ open })

  render () {
    if (!this.props.token) {
      return null
    }
    const { open } = this.state
    const { match, token, community, metadata, networkType, communityAddress, accountAddress } = this.props

    const { address: tokenAddress, name } = token
    const { isClosed } = community
    return (
      <div className='Dashboard'>
        {accountAddress ? <SignIn accountAddress={accountAddress} /> : undefined}
        <div className='Dashboard__container'>
          {
            !isMobile
              ? <SidebarContent isGradientLogo communityName={token && token.name} match={match.url} />
              : <Sidebar
                sidebar={
                  <SidebarContent isGradientLogo communityName={token && token.name} match={match.url} />
                }
                open={open}
                styles={{
                  sidebar: { zIndex: 101 },
                  overlay: { zIndex: 100 }
                }}
                onSetOpen={this.onSetSidebarOpen}
              >
                {!open && <div className='Dashboard__hamburger' onClick={() => this.onSetSidebarOpen(true)}><FontAwesome name='bars' /></div>}
              </Sidebar>
          }
          <div className='content__container'>
            <NavBar withLogo={false} />
            <div className='content'>
              <Header
                metadata={metadata[token.tokenURI] || {}}
                tokenAddress={tokenAddress}
                isClosed={isClosed}
                name={name}
                networkType={networkType}
                token={token}
              />
              <Switch>
                <Route exact path={`${match.url}`} render={() => <Dashboard onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                <Route exact path={`${match.url}/merchants`} render={() => <Businesses onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                <Route exact path={`${match.url}/users`} render={() => <Users onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                <Route exact path={`${match.url}/wallet`} render={() => <WhiteLabelWallet value={communityAddress} onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, { match }) => ({
  accountAddress: getAccountAddress(state),
  networkType: state.network.networkType,
  token: state.entities.communities &&
    state.entities.tokens &&
    state.entities.communities[match.params.address] &&
    state.entities.communities[match.params.address].foreignTokenAddress &&
    state.entities.tokens[state.entities.communities[match.params.address].foreignTokenAddress],
  community: state.entities.communities && state.entities.communities[match.params.address],
  communityAddress: match.params.address,
  tokenNetworkType: getForeignNetwork(state),
  metadata: state.entities.metadata,
  isAdmin: checkIsAdmin(state),
  dashboard: state.screens.dashboard,
  homeTokenAddress: state.entities.bridges[match.params.address] && state.entities.bridges[match.params.address].homeTokenAddress
})

const mapDispatchToProps = {
  fetchCommunity,
  fetchToken,
  fetchTokenProgress,
  isUserExists,
  loadModal,
  hideModal,
  fetchEntities
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardLayout)
