import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Sidebar from 'react-sidebar'
import { isMobile } from 'react-device-detect'
import FontAwesome from 'react-fontawesome'
import { Route, Switch, useParams } from 'react-router'
import get from 'lodash/get'
import { push } from 'connected-react-router'

import { getAccountAddress, getProviderInfo } from 'selectors/accounts'
import { getHomeNetworkType } from 'selectors/network'
import { checkIsAdmin } from 'selectors/entities'
import { getCurrentCommunity } from 'selectors/dashboard'
import { getForeignTokenByCommunityAddress } from 'selectors/token'
import { fetchCommunity } from 'actions/token'
import { fetchHomeTokenAddress, toggleMultiBridge } from 'actions/bridge'
import { fetchMetadata } from 'actions/metadata'
import { loadModal } from 'actions/ui'
import { fetchEntities } from 'actions/communityEntities'
import { withNetwork } from 'containers/Web3'
import withTracker from 'containers/withTracker'

import SidebarContent from 'components/dashboard/components/Sidebar'
import Dashboard from 'components/dashboard/pages/Dashboard'
import WhiteLabelWallet from 'components/dashboard/pages/WhiteLabelWallet'
import TransferPage from 'components/dashboard/pages/Transfer'
import MintBurnPage from 'components/dashboard/pages/MintBurn'
import SettingsPage from 'components/dashboard/pages/Settings'
import PluginsPage from 'components/dashboard/pages/Plugins'
import Users from 'components/dashboard/pages/Users'
import Businesses from 'components/dashboard/pages/Businesses'
import JoinBonusPage from 'components/dashboard/pages/JoinBonus'
import InviteBonusPage from 'components/dashboard/pages/InviteBonus'
import BackupBonusPage from 'components/dashboard/pages/BackupBonus'
import OnRampPage from 'components/dashboard/pages/OnRamp'
import WalletBannerLinkPage from 'components/dashboard/pages/WalletBannerLink'

const DashboardLayout = (props) => {
  const {
    match,
    fetchCommunity,
    foreignToken,
    community,
    accountAddress,
    isAdmin,
    location,
    fetchEntities,
    fetchHomeTokenAddress,
    toggleMultiBridge
  } = props
  const { address: communityAddress } = useParams()
  const [open, onSetSidebarOpen] = useState(false)
  const communityURI = community && community.communityURI
  const foreignTokenAddress = community && community.foreignTokenAddress

  useEffect(() => {
    if (isMobile) {
      onSetSidebarOpen(false)
    }
  }, [location.pathname])

  useEffect(() => {
    if (communityAddress) {
      fetchCommunity(communityAddress, { networkType: 'ropsten' })
      fetchCommunity(communityAddress, { networkType: 'mainnet' })
      fetchEntities(communityAddress)
    }
  }, [communityAddress, accountAddress])

  useEffect(() => {
    if (foreignTokenAddress && accountAddress) {
      fetchHomeTokenAddress(communityAddress, foreignTokenAddress)
    }
  }, [foreignTokenAddress, accountAddress])

  useEffect(() => {
    if (communityURI) {
      toggleMultiBridge(get(community, 'isMultiBridge', false))
      fetchMetadata(communityURI)
    }
  }, [communityURI])

  useEffect(() => {
    if (isAdmin) {
      window.analytics.identify({ role: 'admin', communityAddress })
    }
  }, [isAdmin])

  const qrValue = JSON.stringify({
    tokenAddress: community && community.homeTokenAddress,
    originNetwork: foreignToken && foreignToken.networkType,
    env: CONFIG.env,
    communityAddress
  })

  return (
    <div className='dashboard'>
      <div className='container'>
        {
          !isMobile
            ? (
              <SidebarContent
                match={match.url}
              />
            )
            : <Sidebar
              sidebar={
                <SidebarContent
                  match={match.url}
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
                {get(community, 'plugins.joinBonus') && !get(community, 'plugins.joinBonus.isRemoved', false) && isAdmin && (
                  <Route exact path={`${match.path}/bonus`}>
                    <JoinBonusPage
                      match={match}
                      community={community}
                    />
                  </Route>
                )}

                {get(community, 'plugins.inviteBonus') && !get(community, 'plugins.inviteBonus.isRemoved', false) && isAdmin && (
                  <Route exact path={`${match.path}/invite-bonus`}>
                    <InviteBonusPage
                      match={match}
                      community={community}
                    />
                  </Route>
                )}

                {get(community, 'plugins.backupBonus') && !get(community, 'plugins.backupBonus.isRemoved', false) && isAdmin && (
                  <Route exact path={`${match.path}/backup-bonus`}>
                    <BackupBonusPage
                      match={match}
                      community={community}
                    />
                  </Route>
                )}

                {community && isAdmin && (
                  <Route exact path={`${match.path}/onramp`}
                    render={() => (
                      <OnRampPage
                        community={community}
                      />
                    )}
                  />)
                }

                {community && isAdmin && (
                  <Route exact path={`${match.path}/walletbanner`}
                    render={() => (
                      <WalletBannerLinkPage
                        match={match}
                        community={community}
                      />
                    )}
                  />)
                }

                {isAdmin && (foreignToken && foreignToken.tokenType === 'mintableBurnable') && (
                  <Route exact path={`${match.path}/mintBurn`}>
                    <MintBurnPage />
                  </Route>
                )}

                {isAdmin && (
                  <Route exact path={`${match.path}/settings`}>
                    <SettingsPage
                      community={community}
                    />
                  </Route>
                )}

                {community && isAdmin && (
                  <Route exact path={`${match.path}/plugins`}>
                    <PluginsPage
                      community={community}
                    />
                  </Route>
                )}

                {!get((community && community.plugins), 'businessList.isRemoved', false) && (
                  <Route exact path={`${match.path}/merchants`}>
                    <Businesses />
                  </Route>
                )}

                <Route exact path={`${match.path}/wallet`}>
                  <WhiteLabelWallet value={qrValue} communityAddress={communityAddress} />
                </Route>

                {community && (
                  <Route exact path={`${match.path}/users`}>
                    <Users />
                  </Route>)
                }

                {community && (
                  <Route exact path={`${match.path}/transfer/:sendTo?`}>
                    <TransferPage />
                  </Route>)
                }

                {community && (
                  <Route exact path={`${match.path}/:success?`}>
                    <Dashboard />
                  </Route>)
                }
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
  foreignToken: getForeignTokenByCommunityAddress(state, match.params.address),
  community: getCurrentCommunity(state),
  isAdmin: checkIsAdmin(state),
  homeNetwork: getHomeNetworkType(state),
  providerInfo: getProviderInfo(state)
})

const mapDispatchToProps = {
  fetchCommunity,
  loadModal,
  fetchEntities,
  push,
  fetchHomeTokenAddress,
  toggleMultiBridge
}

export default withTracker(withNetwork(connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardLayout)))
