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
          <div className='item cell large-auto' onClick={plugins}>
            <div className='item__title'>Set up plugins</div>
            <div className='item__subtitle'>Get additional functionality for your community</div>
          </div>
          <div className='item cell large-auto' onClick={wallet}>
            <div className='item__title'>Wallet</div>
            <div className='item__subtitle'>Customize and launched your coin on any mobile device</div>
          </div>
          <div className='item cell large-auto' onClick={users}>
            <div className='item__title'>Users</div>
            <div className='item__subtitle'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
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
