import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Sidebar from 'react-sidebar'
import { isMobile } from 'react-device-detect'
import FontAwesome from 'react-fontawesome'
import { Route, Switch, useParams, withRouter } from 'react-router'
import get from 'lodash/get'
import { push } from 'connected-react-router'

import { getAccountAddress } from 'selectors/accounts'
import { checkIsAdmin } from 'selectors/entities'
import { getCurrentCommunity } from 'selectors/dashboard'
import { getForeignTokenByCommunityAddress } from 'selectors/token'
import { fetchCommunity } from 'actions/token'
import { loadModal } from 'actions/ui'
import { fetchEntities } from 'actions/communityEntities'
import { withNetwork } from 'containers/Web3'

import SidebarContent from 'components/dashboard/components/Sidebar'
import Dashboard from 'components/dashboard/pages/Dashboard'
import WhiteLabelWallet from 'components/dashboard/pages/WhiteLabelWallet'
import TransferPage from 'components/dashboard/pages/Transfer'
import MintBurnPage from 'components/dashboard/pages/MintBurn'
import SettingsPage from 'components/dashboard/pages/Settings'
import PluginsPage from 'components/dashboard/pages/Plugins'
import Users from 'components/dashboard/pages/Users'
import Businesses from 'components/dashboard/pages/Businesses'
import BonusesPage from 'components/dashboard/pages/Bonuses'
import OnRampPage from 'components/dashboard/pages/OnRamp'
import WalletBannerLinkPage from 'components/dashboard/pages/WalletBannerLink'

const WithBgImage = ({ children }) => (
  <div className='content__container content__container--bgImage'>
    <div className='content'>
      <div className='content__wrapper'>
        {children}
      </div>
    </div>
  </div>
)

const DashboardLayout = (props) => {
  const {
    match,
    fetchCommunity,
    foreignToken,
    community,
    accountAddress,
    isAdmin,
    location,
    fetchEntities
  } = props
  const { address: communityAddress } = useParams()
  const [open, onSetSidebarOpen] = useState(false)

  useEffect(() => {
    if (isMobile) {
      onSetSidebarOpen(false)
    }
  }, [location.pathname])

  useEffect(() => {
    if (accountAddress) {
      fetchCommunity(communityAddress, { networkType: 'ropsten' })
      fetchCommunity(communityAddress, { networkType: 'mainnet' })
      fetchEntities(communityAddress)
    }
  }, [accountAddress])

  useEffect(() => {
    if (communityAddress) {
      fetchCommunity(communityAddress, { networkType: 'ropsten' })
      fetchCommunity(communityAddress, { networkType: 'mainnet' })
      fetchEntities(communityAddress)
    }
  }, [communityAddress])

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
        <Switch>
          {get(community, 'plugins.bonuses') && !get(community, 'plugins.bonuses.isRemoved', false) && isAdmin && (
            <Route exact path={`${match.path}/bonuses`}>
              <WithBgImage>
                <BonusesPage
                  match={match}
                  community={community}
                />
              </WithBgImage>
            </Route>
          )}

          {community && isAdmin && (
            <Route exact path={`${match.path}/onramp`}
              render={() => (
                <WithBgImage>
                  <OnRampPage
                    community={community}
                  />
                </WithBgImage>
              )}
            />)
          }

          {community && isAdmin && (
            <Route
              exact
              path={`${match.path}/walletbanner`}
              render={() => (
                <WithBgImage>
                  <WalletBannerLinkPage
                    match={match}
                    community={community}
                  />
                </WithBgImage>
              )}
            />)
          }

          {isAdmin && (foreignToken && foreignToken.tokenType === 'mintableBurnable') && (
            <Route exact path={`${match.path}/mintBurn`}>
              <WithBgImage>
                <MintBurnPage />
              </WithBgImage>
            </Route>
          )}

          {
            isAdmin && (
              <Route exact path={`${match.path}/settings`}>
                <WithBgImage>
                  <SettingsPage
                    community={community}
                  />
                </WithBgImage>
              </Route>
            )
          }

          {
            community && isAdmin && (
              <Route
                exact
                path={`${match.path}/plugins`}
              >
                <WithBgImage>
                  <PluginsPage
                    community={community}
                  />
                </WithBgImage>
              </Route>
            )
          }

          {
            !get((community && community.plugins), 'businessList.isRemoved', false) && (
              <Route exact path={`${match.path}/merchants`}>
                <WithBgImage>
                  <Businesses />
                </WithBgImage>
              </Route>
            )
          }

          <Route exact path={`${match.path}/wallet`}>
            <WithBgImage>
              <WhiteLabelWallet value={qrValue} communityAddress={communityAddress} />
            </WithBgImage>
          </Route>

          {
            community && (
              <Route exact path={`${match.path}/users/:join?`}>
                <WithBgImage>
                  <Users />
                </WithBgImage>
              </Route>
            )
          }

          {
            community && (
              <Route exact path={`${match.path}/transfer/:sendTo?`}>
                <WithBgImage>
                  <TransferPage />
                </WithBgImage>
              </Route>
            )
          }

          {
            community && (
              <Route exact path={`${match.path}/:success?`}>
                <div className='content__container'>
                  <div className='content'>
                    <Dashboard />
                  </div>
                </div>
              </Route>
            )
          }
        </Switch >
      </div >
    </div >
  )
}

const mapStateToProps = (state, { match }) => ({
  accountAddress: getAccountAddress(state),
  foreignToken: getForeignTokenByCommunityAddress(state, match.params.address),
  community: getCurrentCommunity(state),
  isAdmin: checkIsAdmin(state)
})

const mapDispatchToProps = {
  fetchCommunity,
  loadModal,
  fetchEntities,
  push
}

export default withRouter(withNetwork(connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardLayout)))
