import React, { useEffect, useState, memo } from 'react'
import { connect } from 'react-redux'
import Sidebar from 'react-sidebar'
import { isMobile } from 'react-device-detect'
import FontAwesome from 'react-fontawesome'
import { Route, Switch } from 'react-router'
import isEmpty from 'lodash/isEmpty'
import { push } from 'connected-react-router'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import { getBridgeStatus } from 'selectors/network'
import { getAccountAddress, getBalances, getProviderInfo } from 'selectors/accounts'
import { checkIsAdmin } from 'selectors/entities'
import { getTokenAddressOfByNetwork } from 'selectors/dashboard'
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
import SignIn from 'components/common/SignIn'
import NavBar from 'components/common/NavBar'

const GET_COMMUNITY_ORIGIN_NETWORK = (communityAddress) => {
  return gql`
    {
      tokens (where:{communityAddress: "${communityAddress}"}) {
      address
      communityAddress
      originNetwork
    }
  }
`
}

const DashboardLayout = memo((props) => {
  const {
    match,
    fetchCommunity,
    foreignToken,
    community,
    networkType,
    accountAddress,
    isAdmin,
    tokenOfCommunityOnCurrentSide,
    location,
    communityAddress,
    homeToken,
    fetchEntities,
    push,
    providerInfo,
    loadModal,
    web3connect,
    logout
  } = props
  const [open, onSetSidebarOpen] = useState(false)
  const [originNetwork, setOriginNetwork] = useState(false)

  const { loading, error, data } = useQuery(GET_COMMUNITY_ORIGIN_NETWORK(communityAddress))

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
        const wrongNetworkText = providerInfo.type === 'injected'
          ? `Switch to ${desired} through Metamask. `
          : providerInfo.type === 'web'
            ? `Switch to ${desired} through your wallet on the upper right part of the Studio.`
            : `Switch to ${desired}.`
        loadModal(WRONG_NETWORK_MODAL, {
          body: <p>{wrongNetworkText} <br /> This community is issued on {desired}. you need to switch to {desired} to view it</p>,
          supportedNetworks: [desired, 'Fuse'],
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

  useEffect(() => {
    onSetSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (communityAddress) {
      fetchCommunity(communityAddress)
      fetchEntities(communityAddress)
    }
  }, [communityAddress, accountAddress])

  const qrValue = JSON.stringify({
    tokenAddress: community && community.homeTokenAddress,
    originNetwork: foreignToken && foreignToken.networkType,
    env: CONFIG.env
  })

  return (
    <div className='dashboard'>
      {accountAddress ? <SignIn accountAddress={accountAddress} /> : undefined}
      {
        (!community || !foreignToken || !homeToken) ? (
          // TODO - ADD LOADER HERE
          <div>loading...</div>
        ) : (
          <div className='container'>
            {
              !isMobile
                ? <SidebarContent
                  plugins={community && community.plugins}
                  isAdmin={isAdmin}
                  communityName={community.name}
                  match={match.url}
                  tokenType={foreignToken && foreignToken.tokenType}
                  location={location}
                  communityAddress={communityAddress}
                />
                : <Sidebar
                  sidebar={
                    <SidebarContent
                      plugins={community && community.plugins}
                      isAdmin={isAdmin}
                      communityName={community.name}
                      match={match.url}
                      tokenType={foreignToken && foreignToken.tokenType}
                      location={location}
                      communityAddress={communityAddress}
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
              <NavBar logout={logout} web3connect={web3connect} withLogo={false} foreignNetwork={foreignToken && foreignToken.networkType} />
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
                          <PluginsPage community={community} />
                        )}
                      />
                    )}
                    {!get((community && community.plugins), 'businessList.isRemoved', false) && (
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
                    <Route path={`${match.path}/users`} render={() => <Users isAdmin={isAdmin} networkType={networkType} community={community} />} />
                    <Route
                      path={`${match.path}/transfer/:sendTo?`}
                      render={() => (
                        <TransferPage
                          symbol={foreignToken && foreignToken.symbol}
                          networkType={networkType}
                          tokenOfCommunityOnCurrentSide={tokenOfCommunityOnCurrentSide}
                        />
                      )}
                    />
                    <Route exact path={`${match.path}/:success?`} render={() => <Dashboard {...props} />} />
                  </Switch>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}, (prevProps, nextProps) => {
  if (prevProps.isAdmin !== nextProps.isAdmin) {
    return false
  } else if (prevProps.tokenOfCommunityOnCurrentSide !== nextProps.tokenOfCommunityOnCurrentSide) {
    return false
  } else if (prevProps.communityAddress !== nextProps.communityAddress) {
    return false
  } else if (prevProps.networkType !== nextProps.networkType) {
    return false
  } else if (prevProps.community !== nextProps.community) {
    return false
  } else if (prevProps.foreignToken !== nextProps.foreignToken) {
    return false
  } else if (prevProps.match !== nextProps.match) {
    return false
  } else if (prevProps.dashboard !== nextProps.dashboard) {
    return false
  } else if (prevProps.providerInfo !== nextProps.providerInfo) {
    return false
  }

  return true
})

const mapStateToProps = (state, { match }) => ({
  accountAddress: getAccountAddress(state),
  networkType: state.network.networkType,
  homeToken: getHomeTokenByCommunityAddress(state, match.params.address),
  foreignToken: getForeignTokenByCommunityAddress(state, match.params.address),
  community: state.entities.communities[match.params.address],
  communityAddress: match.params.address,
  metadata: state.entities.metadata,
  isAdmin: checkIsAdmin(state),
  balances: getBalances(state),
  bridgeStatus: getBridgeStatus(state),
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
