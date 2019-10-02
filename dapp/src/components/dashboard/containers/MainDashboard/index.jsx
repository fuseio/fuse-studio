import React, { Component } from 'react'
import { connect } from 'react-redux'
import SidebarContent from 'components/dashboard/components/Sidebar'
import Dashboard from 'components/dashboard/pages/Dashboard'
import WhiteLabelWallet from 'components/dashboard/pages/WhiteLabelWallet'
import TransferPage from 'components/dashboard/pages/Transfer'
import MintBurnPage from 'components/dashboard/pages/MintBurn'
import PluginsPage from 'components/dashboard/pages/Plugins'
import JoinBonusPage from 'components/dashboard/pages/JoinBonus'
import { fetchCommunity, fetchTokenTotalSupply, fetchToken } from 'actions/token'
import { isUserExists } from 'actions/user'
import { loadModal } from 'actions/ui'
import { Route, Switch } from 'react-router-dom'
import Users from 'components/dashboard/pages/Users'
import Businesses from 'components/dashboard/pages/Businesses'
import Header from 'components/dashboard/components/Header'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
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
import { changeNetwork } from 'actions/network'
import { balanceOfToken } from 'actions/accounts'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'

class DashboardLayout extends Component {
  state = {
    open: false
  }

  // componentDidMount () {
  //   const { token } = this.props
  //   if (!token) {
  //     const { fetchCommunity, fetchTokenProgress, fetchEntities, communityAddress } = this.props
  //     fetchCommunity(communityAddress)
  //     fetchTokenProgress(communityAddress)
  //     fetchEntities(communityAddress)
  //   }
  // }

  componentDidMount () {
    const { community, communityAddress } = this.props
    debugger
    if (community) {
      this.props.fetchToken(community.homeTokenAddress)
      this.props.fetchToken(community.foreignTokenAddress)
    } else {
      this.props.fetchCommunity(communityAddress)
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.onSetSidebarOpen(false)
    }

    debugger
    if (this.props.community && !prevProps.community) {
      this.props.fetchToken(this.props.community.homeTokenAddress)
      this.props.fetchToken(this.props.community.foreignTokenAddress)
    }

    if (this.props.community && !isEqual(this.props.accountAddress, prevProps.accountAddress)) {
      const { balanceOfToken, community, accountAddress, isAdmin, fetchTokenTotalSupply } = this.props
      const { foreignTokenAddress, homeTokenAddress } = community
      fetchTokenTotalSupply(foreignTokenAddress, { bridgeType: 'foreign' })
      fetchTokenTotalSupply(homeTokenAddress, { bridgeType: 'home' })
      balanceOfToken(foreignTokenAddress, accountAddress, { bridgeType: 'foreign' })
      balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })

      if (window && window.analytics && isAdmin) {
        const { analytics } = window
        analytics.identify(`${accountAddress}`, {
          role: 'admin'
        })
      }
    }

    if (((!prevProps.community && this.props.community) || (!isEqual(this.props.community, prevProps.community))) && this.props.accountAddress) {
      const { balanceOfToken, community, accountAddress, fetchTokenTotalSupply } = this.props
      const { foreignTokenAddress, homeTokenAddress } = community
      fetchTokenTotalSupply(foreignTokenAddress, { bridgeType: 'foreign' })
      fetchTokenTotalSupply(homeTokenAddress, { bridgeType: 'home' })
      balanceOfToken(foreignTokenAddress, accountAddress, { bridgeType: 'foreign' })
      balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })
    }
  }

  onlyOnFuse = (successFunc) => {
    return this.onlyOnNetwork(successFunc, 'fuse')
  }

  onlyOnNetwork = (successFunc, network) => {
    const { networkType, isPortis } = this.props
    if (networkType === network) {
      successFunc()
    } else if (isPortis) {
      const { changeNetwork } = this.props
      changeNetwork(network)
      successFunc()
    } else {
      const { loadModal } = this.props
      loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: [network] })
    }
  }

  onSetSidebarOpen = open => this.setState({ open })

  render () {
    if (!this.props.community || !this.props.foreignToken || !this.props.homeToken) {
      return null
    }

    const { open } = this.state
    const { match, foreignToken, community, metadata, networkType, accountAddress, isAdmin } = this.props

    const { address: tokenAddress, name, tokenType } = foreignToken
    const { isClosed, plugins, homeTokenAddress } = community

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
                {get(plugins, 'joinBonus.isActive', false) && <Route path={`${match.path}/bonus`} render={() => <JoinBonusPage onlyOnFuse={this.onlyOnFuse} {...this.props} />} />}
                {isAdmin && tokenType === 'mintableBurnable' && <Route path={`${match.path}/mintBurn`} render={() => <MintBurnPage onlyOnNetwork={this.onlyOnNetwork} onlyOnFuse={this.onlyOnFuse} {...this.props} />} />}
                {isAdmin && <Route path={`${match.path}/plugins`} render={() => <PluginsPage onlyOnFuse={this.onlyOnFuse} {...this.props} />} />}
                {get(plugins, 'businessList.isActive', false) && <Route exact path={`${match.path}/merchants`} render={() => <Businesses onlyOnFuse={this.onlyOnFuse} {...this.props} />} />}
                <Route path={`${match.path}/wallet`} render={() => <WhiteLabelWallet value={qrValue} onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                <Route path={`${match.path}/users`} render={() => <Users onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                <Route path={`${match.path}/transfer/:sendTo?`} render={() => <TransferPage onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                <Route exact path={`${match.path}/:success?`} render={() => <Dashboard onlyOnFuse={this.onlyOnFuse} {...this.props}>
                  <Header
                    metadata={metadata[foreignToken.tokenURI] || {}}
                    tokenAddress={tokenAddress}
                    isClosed={isClosed}
                    name={name}
                    networkType={networkType}
                    token={foreignToken}
                  />
                </Dashboard>}
                />
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
  fetchToken,
  isUserExists,
  loadModal,
  fetchEntities,
  changeNetwork,
  balanceOfToken,
  fetchTokenTotalSupply
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardLayout)
