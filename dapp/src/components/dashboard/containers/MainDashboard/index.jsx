import React, { Component } from 'react'
import { connect } from 'react-redux'
import SidebarContent from 'components/dashboard/components/Sidebar'
import Dashboard from 'components/dashboard/pages/Dashboard'
import WhiteLabelWallet from 'components/dashboard/pages/WhiteLabelWallet'
import TransferPage from 'components/dashboard/pages/Transfer'
import MintBurnPage from 'components/dashboard/pages/MintBurn'
import PluginsPage from 'components/dashboard/pages/Plugins'
import JoinBonusPage from 'components/dashboard/pages/JoinBonus'
import OnRampPage from 'components/dashboard/pages/OnRamp'
import { fetchCommunity } from 'actions/token'
import { loadModal } from 'actions/ui'
import { Route, Switch } from 'react-router-dom'
import Users from 'components/dashboard/pages/Users'
import Businesses from 'components/dashboard/pages/Businesses'
import Sidebar from 'react-sidebar'
import { isMobile } from 'react-device-detect'
import FontAwesome from 'react-fontawesome'
import { getForeignNetwork, getBridgeStatus } from 'selectors/network'
import NavBar from 'components/common/NavBar'
import { getAccountAddress, getBalances } from 'selectors/accounts'
import { checkIsAdmin } from 'selectors/entities'
import { getTokenAddressOfByNetwork } from 'selectors/dashboard'
import { getForeignTokenByCommunityAddress, getHomeTokenByCommunityAddress } from 'selectors/token'
import { fetchEntities } from 'actions/communityEntities'
import SignIn from 'components/common/SignIn'
import { changeNetwork, getNetworkType } from 'actions/network'
import get from 'lodash/get'

class DashboardLayout extends Component {
  state = {
    open: false
  }

  componentDidMount () {
    const { fetchCommunity, communityAddress, fetchEntities, getNetworkType } = this.props
    getNetworkType(true)
    fetchCommunity(communityAddress)
    fetchEntities(communityAddress)
  }

  componentWillUnmount () {
    window.analytics.reset()
  }

  componentDidUpdate (prevProps) {
    if (this.props.communityAddress !== prevProps.communityAddress) {
      const { fetchCommunity, communityAddress, fetchEntities } = this.props
      this.onSetSidebarOpen(false)
      fetchCommunity(communityAddress)
      fetchEntities(communityAddress)
    }

    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.onSetSidebarOpen(false)
    }

    if (prevProps.isAdmin !== this.props.isAdmin) {
      const { accountAddress, isAdmin, networkType, location, communityAddress } = this.props
      const { analytics } = window
      if (isAdmin) {
        if (location.pathname.includes('/justCreated')) {
          analytics.reset()
        }

        analytics.identify(`${accountAddress}`, { role: 'admin', communityAddress })

        if (networkType === 'fuse') {
          analytics.identify(`${accountAddress}`, {
            switchToFuse: true
          })
        } else {
          analytics.identify(`${accountAddress}`, {
            switchToFuse: false
          })
        }
      } else {
        analytics.reset()
        analytics.identify(`${accountAddress}`, {
          role: 'user'
        })
      }
    }
  }

  onSetSidebarOpen = open => this.setState({ open })

  render () {
    if (!this.props.community || !this.props.foreignToken || !this.props.homeToken) {
      return null
    }

    const { open } = this.state
    const {
      match,
      foreignToken,
      community,
      networkType,
      accountAddress,
      isAdmin,
      tokenOfCommunityOnCurrentSide,
      location,
      communityAddress,
      isPortis,
      changeNetwork
    } = this.props

    const { tokenType, symbol } = foreignToken
    const { plugins, homeTokenAddress } = community

    const qrValue = JSON.stringify({
      tokenAddress: homeTokenAddress,
      originNetwork: foreignToken.networkType,
      env: CONFIG.env
    })

    return (
      <div className='dashboard'>
        {accountAddress ? <SignIn accountAddress={accountAddress} /> : undefined}
        <div className='container'>
          {
            !isMobile
              ? <SidebarContent
                plugins={plugins}
                isAdmin={isAdmin}
                isGradientLogo
                communityName={community.name}
                match={match.url}
                tokenType={tokenType}
                location={location}
                communityAddress={communityAddress}
              />
              : <Sidebar
                sidebar={
                  <SidebarContent
                    plugins={plugins}
                    isAdmin={isAdmin}
                    isGradientLogo
                    communityName={community.name}
                    match={match.url}
                    tokenType={tokenType}
                    location={location}
                    communityAddress={communityAddress}
                  />
                }
                open={open}
                styles={{
                  sidebar: { zIndex: 101 },
                  overlay: { zIndex: 100 }
                }}
                onSetOpen={this.onSetSidebarOpen}
              >
                {!open && <div className='hamburger' onClick={() => this.onSetSidebarOpen(true)}><FontAwesome name='bars' /></div>}
              </Sidebar>
          }
          <div className='content__container'>
            <NavBar withLogo={false} />
            <div className='content'>
              <Switch>
                {!get(plugins, 'joinBonus.isRemoved', false) && isAdmin && (
                  <Route path={`${match.path}/bonus`}
                    render={() => (
                      <JoinBonusPage
                        isPortis={isPortis}
                        changeNetwork={changeNetwork}
                        symbol={symbol}
                        community={community}
                        networkType={networkType}
                        tokenOfCommunityOnCurrentSide={tokenOfCommunityOnCurrentSide}
                      />
                    )}
                  />
                )}
                <Route path={`${match.path}/onramp/:name`}
                  render={({ match }) => (
                    <OnRampPage
                      match={match}
                      community={community}
                      plugin={get(community, `plugins.${match.params.name}`, {})}
                    />
                  )}
                />
                {isAdmin && tokenType === 'mintableBurnable' && (
                  <Route
                    path={`${match.path}/mintBurn`}
                    render={() => (
                      <MintBurnPage
                        symbol={symbol}
                        tokenAddress={foreignToken.address}
                        networkType={networkType}
                        accountAddress={accountAddress}
                        tokenOfCommunityOnCurrentSide={tokenOfCommunityOnCurrentSide}
                      />
                    )}
                  />
                )}
                {isAdmin && (
                  <Route
                    path={`${match.path}/plugins`}
                    render={() => (
                      <PluginsPage
                        isPortis={isPortis}
                        changeNetwork={changeNetwork}
                        community={community}
                        networkType={networkType}
                      />
                    )}
                  />
                )}
                {get(plugins, 'businessList.isActive', false) && (
                  <Route
                    exact
                    path={`${match.path}/merchants`}
                    render={() => (
                      <Businesses
                        community={community}
                        isAdmin={isAdmin}
                        networkType={networkType}
                      />
                    )}
                  />
                )}
                <Route path={`${match.path}/wallet`} render={() => <WhiteLabelWallet value={qrValue} />} />
                <Route path={`${match.path}/users`} render={() => <Users networkType={networkType} community={community} />} />
                <Route
                  path={`${match.path}/transfer/:sendTo?`}
                  render={() => (
                    <TransferPage
                      symbol={symbol}
                      networkType={networkType}
                      tokenOfCommunityOnCurrentSide={tokenOfCommunityOnCurrentSide}
                    />
                  )}
                />
                <Route exact path={`${match.path}/:success?`} render={() => <Dashboard {...this.props} />} />
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
  homeToken: getHomeTokenByCommunityAddress(state, match.params.address),
  foreignToken: getForeignTokenByCommunityAddress(state, match.params.address),
  isPortis: state.network.isPortis,
  community: state.entities.communities[match.params.address],
  communityAddress: match.params.address,
  tokenNetworkType: getForeignNetwork(state),
  metadata: state.entities.metadata,
  isAdmin: checkIsAdmin(state),
  balances: getBalances(state),
  bridgeStatus: getBridgeStatus(state),
  dashboard: state.screens.dashboard,
  tokenOfCommunityOnCurrentSide: getTokenAddressOfByNetwork(state, state.entities.communities[match.params.address])
})

const mapDispatchToProps = {
  fetchCommunity,
  loadModal,
  fetchEntities,
  changeNetwork,
  getNetworkType
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardLayout)
