import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Sidebar from 'react-sidebar'
import { isMobileOnly } from 'react-device-detect'
import FontAwesome from 'react-fontawesome'
import { Route, Switch, useParams } from 'react-router'
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
    fetchEntities
  } = props
  const { address: communityAddress } = useParams()
  const [open, onSetSidebarOpen] = useState(false)

  useEffect(() => {
    if (isMobileOnly) {
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
          !isMobileOnly
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
          {get(community, 'plugins.joinBonus') && !get(community, 'plugins.joinBonus.isRemoved', false) && isAdmin && (
            <Route exact path={`${match.path}/bonus`}>
              <div className='content__container content__container--bgImage'>
                <div className='content'>
                  <div className='content__wrapper'>
                    <JoinBonusPage
                      match={match}
                      community={community}
                    />
                  </div>
                </div>
              </div>
            </Route>
          )}

          {get(community, 'plugins.inviteBonus') && !get(community, 'plugins.inviteBonus.isRemoved', false) && isAdmin && (
            <Route exact path={`${match.path}/invite-bonus`}>
              <div className='content__container content__container--bgImage'>
                <div className='content'>
                  <div className='content__wrapper'>
                    <InviteBonusPage
                      match={match}
                      community={community}
                    />
                  </div>
                </div>
              </div>
            </Route>
          )}

          {get(community, 'plugins.backupBonus') && !get(community, 'plugins.backupBonus.isRemoved', false) && isAdmin && (
            <Route exact path={`${match.path}/backup-bonus`}>
              <div className='content__container content__container--bgImage'>
                <div className='content'>
                  <div className='content__wrapper'>
                    <BackupBonusPage
                      match={match}
                      community={community}
                    />
                  </div>
                </div>
              </div>
            </Route>
          )}

          {community && isAdmin && (
            <Route exact path={`${match.path}/onramp`}
              render={() => (
                <div className='content__container content__container--bgImage'>
                  <div className='content'>
                    <div className='content__wrapper'>
                      <OnRampPage
                        community={community}
                      />
                    </div>
                  </div>
                </div>
              )}
            />)
          }

          {community && isAdmin && (
            <Route exact path={`${match.path}/walletbanner`}
              render={() => (
                <div className='content__container content__container--bgImage'>
                  <div className='content'>
                    <div className='content__wrapper'>
                      <WalletBannerLinkPage
                        match={match}
                        community={community}
                      />
                    </div>
                  </div>
                </div>
              )}
            />)
          }

          {isAdmin && (foreignToken && foreignToken.tokenType === 'mintableBurnable') && (
            <Route exact path={`${match.path}/mintBurn`}>
              <div className='content__container content__container--bgImage'>
                <div className='content'>
                  <div className='content__wrapper'>
                    <MintBurnPage />
                  </div>
                </div>
              </div>
            </Route>
          )}

          {isAdmin && (
            <Route exact path={`${match.path}/settings`}>
              <div className='content__container content__container--bgImage'>
                <div className='content'>
                  <div className='content__wrapper'>
                    <SettingsPage
                      community={community}
                    />
                  </div>
                </div>
              </div>
            </Route>
          )}

          {community && isAdmin && (
            <Route exact path={`${match.path}/plugins`}>
              <div className='content__container content__container--bgImage'>
                <div className='content'>
                  <div className='content__wrapper'>
                    <PluginsPage
                      community={community}
                    />
                  </div>
                </div>
              </div>
            </Route>
          )}

          {!get((community && community.plugins), 'businessList.isRemoved', false) && (
            <Route exact path={`${match.path}/merchants`}>
              <div className='content__container content__container--bgImage'>
                <div className='content'>
                  <div className='content__wrapper'>
                    <Businesses />
                  </div>
                </div>
              </div>
            </Route>
          )}

          <Route exact path={`${match.path}/wallet`}>
            <div className='content__container content__container--bgImage'>
              <div className='content'>
                <div className='content__wrapper'>
                  <WhiteLabelWallet value={qrValue} communityAddress={communityAddress} />
                </div>
              </div>
            </div>
          </Route>

          {community && (
            <Route exact path={`${match.path}/users`}>
              <div className='content__container content__container--bgImage'>
                <div className='content'>
                  <div className='content__wrapper'>
                    <Users />
                  </div>
                </div>
              </div>
            </Route>)
          }

          {community && (
            <Route exact path={`${match.path}/transfer/:sendTo?`}>
              <div className='content__container content__container--bgImage'>
                <div className='content'>
                  <div className='content__wrapper'>
                    <TransferPage />
                  </div>
                </div>
              </div>
            </Route>)
          }

          {community && (
            <Route exact path={`${match.path}/:success?`}>
              <div className='content__container'>
                <div className='content'>
                  <Dashboard />
                </div>
              </div>
            </Route>)
          }
        </Switch>
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

export default withTracker(withNetwork(connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardLayout)))
