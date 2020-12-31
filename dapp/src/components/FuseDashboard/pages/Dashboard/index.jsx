import React from 'react'
import { useParams } from 'react-router'
import CommunityInfo from 'components/FuseDashboard/components/CommunityInfo'
import Bridge from 'components/FuseDashboard/components/Bridge'
import Header from 'components/FuseDashboard/components/Header'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
import { withRouter } from 'react-router'
import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'
import Plugins from 'images/setup_plugins.svg'
import Users from 'images/setup_users.svg'
import Wallet from 'images/setup_wallet.svg'

function CommunityBanner(props) {
  const { address } = useParams()
  const dispatch = useDispatch()

  const wallet = () => {
    dispatch(push(`/view/fuse-community/${address}/wallet`))
  }

  const plugins = () => {
    dispatch(push(`/view/fuse-community/${address}/plugins`))
  }

  const users = () => {
    dispatch(push(`/view/fuse-community/${address}/users`))
  }

  return (
    <div className='banner'>
      <div className='banner__container'>
        <div className='title'>Community created successfully!</div>
        <div className='sub-title'>Continue setting up your community</div>
        <div className='boxes grid-x align-middle align-justify grid-margin-x'>
          <div className='item cell large-auto grid-x align-middle align-spaced' onClick={plugins}>
            <div className='image cell small-6'>
              <img src={Plugins} />
            </div>
            <div className='content cell large-auto'>
              <div className='content__title'>Set plug-ins</div>
              <div className='content__subtitle'>Easily add new functionality to your community</div>
            </div>
          </div>
          <div className='item cell large-auto grid-x align-middle align-spaced' onClick={wallet}>
            <div className='image cell small-6'>
              <img src={Wallet} />
            </div>
            <div className='content cell large-auto'>
              <div className='content__title'>Set up wallet</div>
              <div className='content__subtitle'>Experience your community on iOS or Android</div>
            </div>
          </div>
          <div className='item cell large-auto grid-x align-middle align-spaced' onClick={users}>
            <div className='image cell small-6'>
              <img src={Users} />
            </div>
            <div className='content cell large-auto'>
              <div className='content__title'>Invite users</div>
              <div className='content__subtitle'>Manage community members and set permissions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Banner = withRouter(CommunityBanner)

function Dashboard(props) {
  const { dashboard } = useStore()
  const { success } = useParams()

  const handleConfirmation = () => {
    dashboard.fetchTokensTotalSupply()
    dashboard.fetchTokenBalances(accountAddress)
    dashboard.checkAllowance(accountAddress)
  }

  return (
    <div className='content__wrapper'>
      <Header withLogo />
      {
        success && <Banner />
      }
      <CommunityInfo />
      {
        (dashboard?.community?.bridgeDirection === 'foreign-to-home') && (
          <Bridge
            onConfirmation={handleConfirmation}
          />
        )
      }
    </div>
  )
}

export default observer(Dashboard)
