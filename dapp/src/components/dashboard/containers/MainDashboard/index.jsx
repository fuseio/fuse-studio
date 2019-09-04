import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import SidebarContent from 'components/dashboard/components/Sidebar'
import Dashboard from 'components/dashboard/pages/Dashboard'
import WhiteLabelWallet from 'components/dashboard/pages/WhiteLabelWallet'
import TransferPage from 'components/dashboard/pages/Transfer'
import MintBurnPage from 'components/dashboard/pages/MintBurn'
import PluginsPage from 'components/dashboard/pages/Plugins'
import JoinBonusPage from 'components/dashboard/pages/JoinBonus'
import { fetchCommunity, fetchTokenProgress } from 'actions/token'
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
import { getToken, getTokenAddressOfByNetwork } from 'selectors/dashboard'
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

  componentDidMount () {
    if (window && window.Appcues) {
      window.Appcues.anonymous()
    }

    const { token } = this.props
    if (!token) {
      const { fetchCommunity, fetchTokenProgress, fetchEntities, communityAddress } = this.props
      fetchCommunity(communityAddress)
      fetchTokenProgress(communityAddress)
      fetchEntities(communityAddress)
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.onSetSidebarOpen(false)
    }

    if (this.props.match.params.address !== prevProps.match.params.address) {
      const { communityAddress, fetchCommunity, fetchTokenProgress, fetchEntities } = this.props
      fetchCommunity(communityAddress)
      fetchTokenProgress(communityAddress)
      fetchEntities(communityAddress)
    }

    if (!isEqual(this.props.accountAddress, prevProps.accountAddress)) {
      const { balanceOfToken, community, accountAddress } = this.props
      const { foreignTokenAddress, homeTokenAddress } = community
      balanceOfToken(foreignTokenAddress, accountAddress, { bridgeType: 'foreign' })
      balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })
    }

    if (((!prevProps.community && this.props.community) || (!isEqual(this.props.community, prevProps.community))) && this.props.accountAddress) {
      const { balanceOfToken, community, accountAddress } = this.props
      const { foreignTokenAddress, homeTokenAddress } = community
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
    if (!this.props.token) {
      return null
    }
    const { open } = this.state
    const { match, token, community, metadata, networkType, communityAddress, accountAddress, isAdmin } = this.props

    const { address: tokenAddress, name, tokenType } = token
    const { isClosed, plugins } = community
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
                communityName={token && token.name}
                match={match.url}
                tokenType={tokenType}
              />
              : <Sidebar
                sidebar={
                  <SidebarContent
                    plugins={plugins}
                    isAdmin={isAdmin}
                    isGradientLogo
                    communityName={token && token.name}
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
                <Route exact path={`/view/community/:address`} render={() => <Dashboard onlyOnFuse={this.onlyOnFuse} {...this.props}>
                  <Header
                    metadata={metadata[token.tokenURI] || {}}
                    tokenAddress={tokenAddress}
                    isClosed={isClosed}
                    name={name}
                    networkType={networkType}
                    token={token}
                  />
                </Dashboard>}
                />
                <Route exact path={`/view/community/:address/plugins`} render={() => <PluginsPage onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                {get(plugins, 'businessList.isActive', false) && <Route exact path={`/view/community/:address/merchants`} render={() => <Businesses onlyOnFuse={this.onlyOnFuse} {...this.props} />} />}
                {get(plugins, 'joinBonus.isActive', false) && <Route exact path={`/view/community/:address/bonus`} render={() => <JoinBonusPage onlyOnFuse={this.onlyOnFuse} {...this.props} />} />}
                <Route exact path={`/view/community/:address/users`} render={() => <Users onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                <Route exact path={`/view/community/:address/wallet`} render={() => <WhiteLabelWallet value={communityAddress} onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                <Route exact path={`/view/community/:address/transfer/:sendTo?`} render={() => <TransferPage onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                {
                  isAdmin && tokenType === 'mintableBurnable' && (
                    <Fragment>
                      <Route exact path={`/view/community/:address/mintBurn`} render={() => <MintBurnPage onlyOnNetwork={this.onlyOnNetwork} onlyOnFuse={this.onlyOnFuse} {...this.props} />} />
                    </Fragment>
                  )
                }
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
  token: getToken(state, match.params.address),
  isPortis: state.network.isPortis,
  community: state.entities.communities[match.params.address] || {},
  communityAddress: match.params.address,
  tokenNetworkType: getForeignNetwork(state),
  metadata: state.entities.metadata,
  isAdmin: checkIsAdmin(state),
  balances: getBalances(state),
  bridgeStatus: getBridgeStatus(state),
  dashboard: state.screens.dashboard,
  homeTokenAddress: state.entities.bridges[match.params.address] && state.entities.bridges[match.params.address].homeTokenAddress,
  tokenOfCommunityOnCurrentSide: getTokenAddressOfByNetwork(state, state.entities.communities[match.params.address])
})

const mapDispatchToProps = {
  fetchCommunity,
  fetchTokenProgress,
  isUserExists,
  loadModal,
  fetchEntities,
  changeNetwork,
  balanceOfToken
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardLayout)
