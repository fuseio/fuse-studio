import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Sidebar from 'react-sidebar'
import { isMobile } from 'react-device-detect'
import FontAwesome from 'react-fontawesome'
import { Route, Switch, useParams } from 'react-router'
import isEmpty from 'lodash/isEmpty'
import { push } from 'connected-react-router'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

// import { getBridgeStatus } from 'selectors/network'
import { getAccountAddress, getBalances, getProviderInfo } from 'selectors/accounts'
import { getHomeNetworkType } from 'selectors/network'
import { checkIsAdmin } from 'selectors/entities'
import { getTokenAddressOfByNetwork, getCurrentCommunity } from 'selectors/dashboard'
import { getForeignTokenByCommunityAddress, getHomeTokenByCommunityAddress } from 'selectors/token'
import { fetchCommunity } from 'actions/token'
import { loadModal } from 'actions/ui'
import { fetchEntities } from 'actions/communityEntities'
import { changeNetwork } from 'actions/network'
import get from 'lodash/get'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import { withNetwork } from 'containers/Web3'
import withTracker from 'containers/withTracker'

import SidebarContent from 'components/dashboard/components/Sidebar'
import Dashboard from 'components/dashboard/pages/Dashboard'
import WhiteLabelWallet from 'components/dashboard/pages/WhiteLabelWallet'
import TransferPage from 'components/dashboard/pages/Transfer'
import MintBurnPage from 'components/dashboard/pages/MintBurn'
import PluginsPage from 'components/dashboard/pages/Plugins'
import Users from 'components/dashboard/pages/Users'
import Businesses from 'components/dashboard/pages/Businesses'
import JoinBonusPage from 'components/dashboard/pages/JoinBonus'
import OnRampPage from 'components/dashboard/pages/OnRamp'
// import SignIn from 'components/common/SignIn'

const GET_COMMUNITY_ORIGIN_NETWORK = (communityAddress) => {
  return gql`
    {
      tokens (where:{communityAddress: "${communityAddress}"}) {
      originNetwork
    }
  }
`
}

const DashboardLayout = (props) => {
  const {
    match,
    fetchCommunity,
    homeNetwork,
    foreignToken,
    community,
    networkType,
    accountAddress,
    isAdmin,
    tokenOfCommunityOnCurrentSide,
    location,
    homeToken,
    fetchEntities,
    push,
    providerInfo,
    loadModal,
    dashboard,
    metadata
  } = props
  const { address: communityAddress } = useParams()
  const [open, onSetSidebarOpen] = useState(false)
  const [originNetwork, setOriginNetwork] = useState(false)
  const { fetchCommunityData } = dashboard
  const { loading, error, data } = useQuery(GET_COMMUNITY_ORIGIN_NETWORK(communityAddress))

  useEffect(() => {
    onSetSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (communityAddress && accountAddress && (!community || !foreignToken || !homeToken)) {
      fetchCommunity(communityAddress)
      fetchEntities(communityAddress)
    }
  }, [communityAddress, accountAddress])

  useEffect(() => {
    if (!loading) {
      if (!isEmpty(data) && !error) {
        const { tokens } = data
        const { originNetwork } = tokens[0]
        setOriginNetwork(originNetwork === 'mainnet' ? 'main' : originNetwork)
      }
    }
  }, [data, loading, error])

  useEffect(() => {
    if (originNetwork) {
      if (networkType !== 'fuse' && networkType && networkType !== originNetwork) {
        const desired = originNetwork
        loadModal(WRONG_NETWORK_MODAL, {
          body: <p>You need to switch network to view this community <br /> This community is issued on {desired}. Switch to {desired} through {providerInfo.name} to view it</p>,
          supportedNetworks: [desired, homeNetwork],
          handleClose: () => push('/')
        })
      }
    }
  }, [originNetwork])

  useEffect(() => {
    if (isAdmin) {
      window.analytics.identify(`${accountAddress}`, { role: 'admin', communityAddress })

      if (networkType === 'fuse') {
        window.analytics.identify(`${accountAddress}`, {
          switchToFuse: true
        })
      } else {
        window.analytics.identify(`${accountAddress}`, {
          switchToFuse: false
        })
      }
    } else {
      window.analytics.identify(`${accountAddress}`, {
        role: 'user'
      })
    }
  }, [isAdmin])

  const qrValue = JSON.stringify({
    tokenAddress: community && community.homeTokenAddress,
    originNetwork: foreignToken && foreignToken.networkType,
    env: CONFIG.env
  })

  return (
    <div className='dashboard'>
      <div className='container'>
        {
          !isMobile
            ? (
              <SidebarContent
                match={match.url}
                location={location}
              />
            )
            : <Sidebar
              sidebar={
                <SidebarContent
                  match={match.url}
                  location={location}
                />
              }
              open={open}
              styles={{
                sidebar: { zIndex: 101 },
                overlay: { zIndex: 100 }
              }}
              onSetOpen={onSetSidebarOpen}
            >
              {!open && <div className='hamburger' onClick={() => onSetSidebarOpen(true)}><FontAwesome name='bars' /></div>}
            </Sidebar>
        }
        <div className='content__container'>
          <div className='content'>
            <div className='content__wrapper'>
              <Switch>
                {!get(community && community.plugins, 'joinBonus.isRemoved', false) && isAdmin && (
                  <Route path={`${match.path}/bonus`}
                    render={() => (
                      <JoinBonusPage
                        symbol={foreignToken && foreignToken.symbol}
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
                {isAdmin && (foreignToken && foreignToken.tokenType === 'mintableBurnable') && (
                  <Route
                    path={`${match.path}/mintBurn`}
                    render={() => (
                      <MintBurnPage
                        symbol={foreignToken && foreignToken.symbol}
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
                        community={community}
                        fetchCommunityData={fetchCommunityData}
                      />
                    )}
                  />
                )}
                {!get((community && community.plugins), 'businessList.isRemoved', false) && (
                  <Route
                    exact
                    path={`${match.path}/merchants`}
                    render={() => (
                      <Businesses
                        // isAdmin={isAdmin}
                        // community={community}
                        // networkType={networkType}
                        // fetchCommunityData={fetchCommunityData}
                      />
                    )}
                  />
                )}
                <Route path={`${match.path}/wallet`} render={() => (
                  <WhiteLabelWallet
                    value={qrValue}
                    // fetchCommunityData={fetchCommunityData}
                  />
                )} />
                <Route path={`${match.path}/users`} render={() => (
                  <Users
                    // isAdmin={isAdmin}
                    // community={community}
                    // networkType={networkType}
                    // fetchCommunityData={fetchCommunityData}
                  />
                )} />
                <Route
                  path={`${match.path}/transfer/:sendTo?`}
                  render={() => (
                    <TransferPage
                      loading={fetchCommunityData}
                      symbol={foreignToken && foreignToken.symbol}
                      networkType={networkType}
                      tokenOfCommunityOnCurrentSide={tokenOfCommunityOnCurrentSide}
                    />
                  )}
                />
                <Route exact path={`${match.path}/:success?`} render={() => (
                  <Dashboard
                    loading={fetchCommunityData}
                    community={community}
                    foreignToken={foreignToken}
                    accountAddress={accountAddress}
                    dashboard={dashboard}
                    metadata={metadata}
                    tokenOfCommunityOnCurrentSide={tokenOfCommunityOnCurrentSide}
                    isAdmin={isAdmin}
                  />
                )} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state, { match }) => ({
  accountAddress: getAccountAddress(state),
  homeToken: getHomeTokenByCommunityAddress(state, match.params.address),
  foreignToken: getForeignTokenByCommunityAddress(state, match.params.address),
  community: getCurrentCommunity(state, [match.params.address]),
  metadata: state.entities.metadata,
  isAdmin: checkIsAdmin(state),
  balances: getBalances(state),
  homeNetwork: getHomeNetworkType(state),
  dashboard: state.screens.dashboard,
  tokenOfCommunityOnCurrentSide: getTokenAddressOfByNetwork(state, state.entities.communities[match.params.address]),
  providerInfo: getProviderInfo(state)
})

const mapDispatchToProps = {
  fetchCommunity,
  loadModal,
  fetchEntities,
  changeNetwork,
  push
}

export default withTracker(withNetwork(connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardLayout)))
