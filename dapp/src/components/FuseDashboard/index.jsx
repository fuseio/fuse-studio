import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import Sidebar from 'react-sidebar'
import { isMobile } from 'react-device-detect'
import FontAwesome from 'react-fontawesome'
import { Route, Switch, useParams, withRouter } from 'react-router'
import { useStore } from 'store/mobx'
import get from 'lodash/get'

import SidebarContent from 'components/FuseDashboard/components/Sidebar'
import Dashboard from 'components/FuseDashboard/pages/Dashboard'
import WhiteLabelWallet from 'components/FuseDashboard/pages/WhiteLabelWallet'
import TransferPage from 'components/FuseDashboard/pages/Transfer'
import MintBurnPage from 'components/FuseDashboard/pages/MintBurn'
import SettingsPage from 'components/FuseDashboard/pages/Settings'
import PluginsPage from 'components/FuseDashboard/pages/Plugins'
import FuseswapPage from 'components/FuseDashboard/pages/Fuseswap'
import Users from 'components/FuseDashboard/pages/Users'
import Businesses from 'components/FuseDashboard/pages/Businesses'
import BonusesPage from 'components/FuseDashboard/pages/Bonuses'
import BridgePage from 'components/FuseDashboard/pages/Bridge'
import OnRampPage from 'components/FuseDashboard/pages/OnRamp'
import WalletBannerLinkPage from 'components/FuseDashboard/pages/WalletBannerLink'

const WithBgImage = ({ children }) => (
  <div className='content__container content__container--bgImage'>
    <div className='content'>
      <div className='content__wrapper'>
        {children}
      </div>
    </div>
  </div>
)

const DashboardLayout = ({
  match,
  location
}) => {
  const { address: communityAddress } = useParams()
  const { dashboard, network } = useStore()
  const { accountAddress } = network
  const { isAdmin, foreignTokenAddress } = dashboard

  useEffect(() => {
    dashboard.fetchCommunity(communityAddress)
  }, [communityAddress])

  useEffect(() => {
    if (isAdmin) {
      dashboard.fetchFuseFunderBalance()
    }
  }, [isAdmin])

  useEffect(() => {
    if (accountAddress) {
      dashboard.fetchTokenBalances(accountAddress)
      dashboard.checkIsCommunityMember(accountAddress)
    }
  }, [dashboard?.community, network?.accountAddress])

  useEffect(() => {
    if (foreignTokenAddress) {
      dashboard.fetchTokenBalances(accountAddress)
    }
  }, [dashboard?.community?.foreignTokenAddress, network?.accountAddress])

  const [open, onSetSidebarOpen] = useState(false)

  useEffect(() => {
    if (isMobile) {
      onSetSidebarOpen(false)
    }
  }, [location?.pathname])

  useEffect(() => {
    if (isAdmin) {
      window.analytics.identify({ role: 'admin', communityAddress })
    }
  }, [dashboard?.isAdmin])

  const qrValue = JSON.stringify({
    tokenAddress: dashboard?.community?.homeTokenAddress,
    originNetwork: dashboard?.baseUrl,
    env: CONFIG.env,
    communityAddress
  })

  return (
    <div className='dashboard'>
      <div className='container'>
        {
          !isMobile
            ? <SidebarContent match={match.url} />
            : (
              <Sidebar
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
              )
        }
        <Switch>
          {get(dashboard?.plugins, 'bonuses') && !get(dashboard?.plugins, 'bonuses.isRemoved', false) && dashboard?.isAdmin && (
            <Route exact path={`${match.path}/bonuses`}>
              <WithBgImage>
                <BonusesPage />
              </WithBgImage>
            </Route>
          )}

          {
            dashboard?.community && dashboard?.isAdmin && (
              <Route
                exact
                path={`${match.path}/onramp`}
              >
                <WithBgImage>
                  <OnRampPage />
                </WithBgImage>
              </Route>
            )
          }

          {
            dashboard?.community && dashboard?.isAdmin && (
              <Route
                exact
                path={`${match.path}/fuseswap`}
              >
                <WithBgImage>
                  <FuseswapPage />
                </WithBgImage>
              </Route>
            )
          }
          {
            dashboard?.community && dashboard?.isAdmin && (
              <Route
                exact
                path={`${match.path}/walletbanner`}
              >
                <WithBgImage>
                  <WalletBannerLinkPage />
                </WithBgImage>
              </Route>
            )
          }

          {
            dashboard?.community &&
            dashboard?.community?.bridgeDirection === 'home-to-foreign' && (
              <Route
                exact
                path={`${match.path}/bridge`}
              >
                <WithBgImage>
                  <BridgePage />
                </WithBgImage>
              </Route>
            )
          }

          {dashboard?.isAdmin && (dashboard?.homeToken?.tokenType === 'mintableBurnable') && (
            <Route exact path={`${match.path}/mintBurn`}>
              <WithBgImage>
                <MintBurnPage />
              </WithBgImage>
            </Route>
          )}

          {dashboard?.isAdmin && (
            <Route exact path={`${match.path}/settings`}>
              <WithBgImage>
                <SettingsPage />
              </WithBgImage>
            </Route>
          )}
          {dashboard?.community && dashboard?.isAdmin && (
            <Route
              exact
              path={`${match.path}/plugins`}
            >
              <WithBgImage>
                <PluginsPage />
              </WithBgImage>
            </Route>
          )}

          {
            !get((dashboard?.plugins), 'businessList.isRemoved', false) && (
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
            dashboard?.community && (
              <Route exact path={`${match.path}/users/:join?`}>
                <WithBgImage>
                  <Users />
                </WithBgImage>
              </Route>
            )
          }

          {
            dashboard?.community && (
              <Route exact path={`${match.path}/transfer/:sendTo?`}>
                <WithBgImage>
                  <TransferPage />
                </WithBgImage>
              </Route>
            )
          }

          {
            dashboard?.community && (
              <Route path={`${match.path}/:success?`}>
                <div className='content__container'>
                  <div className='content'>
                    <Dashboard />
                  </div>
                </div>
              </Route>
            )
          }
        </Switch>
      </div>
    </div>
  )
}

export default withRouter(observer(DashboardLayout))
