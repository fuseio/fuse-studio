import React from 'react'
import { push } from 'connected-react-router'
import { isMobileOnly } from 'react-device-detect'
import { connect } from 'react-redux'

import withTracker from 'containers/withTracker'
import MyCommunities from 'components/home/components/MyCommunities'
import Faqs from 'components/home/components/Faq'
import FeaturedCommunities from 'components/home/components/FeaturedCommunities'
import { loadModal } from 'actions/ui'
import { WEB3_CONNECT_MODAL } from 'constants/uiConstants'

import personImage from 'images/person.png'
import groupImageMobile from 'images/group_mobile.png'
import groupImage from 'images/group_image.png'
import arrowImage from 'images/arrow_1.svg'

import { getCommunitiesKeys } from 'selectors/accounts'

const HomePage = ({
  accountAddress,
  web3connect,
  push,
  loadModal
}) => {
  const showIssuance = (templateId) => {
    if (!accountAddress) {
      if (window && window.analytics) {
        window.analytics.track('Launch community button pressed - not connected')
      }
      loadModal(WEB3_CONNECT_MODAL, { web3connect })
    } else {
      window.analytics.track('Launch community button pressed - connected')
      const path = templateId ? `/view/issuance/${templateId}` : '/view/issuance'
      push(path)
    }
  }

  const showDashboard = (communityAddress, name) => {
    if (window && window.analytics) {
      if (name) {
        window.analytics.track(`Clicked on featured community`, { name })
      }
    }
    push(`/view/community/${communityAddress}`)
  }

  return (
    <div className='home_page'>
      <div className='home_page__wrapper grid-container'>
        <div className='home_page__banner grid-x align-middle'>
          <div className='home_page__content cell medium-12 large-9' style={{ height: '50%', paddingBottom: '50px' }}>
            <h2 className='home_page__title'>Welcome to Fuse studio</h2>
            <p className='home_page__text'>
              Create your own custom branded wallet and currency in a few simple steps
            </p>
            <div className='home_page__button'>
              <button onClick={() => {
                showIssuance()
              }}>
                Launch your community
                <span style={{ marginLeft: '5px' }}>
                  <img src={arrowImage} alt='arrow' />
                </span>
              </button>
            </div>
          </div>
          <div className='home_page__image home_page__image--second cell large-12 medium-12 small-18'>
            <img src={personImage} />
            <img src={!isMobileOnly ? groupImage : groupImageMobile} />
          </div>
        </div>
      </div>
      <div className='home_page__faq'>
        <div className='grid-container'>
          <div className='grid-x align-justify grid-margin-x grid-margin-y'>
            <div className='cell medium-24 large-12'>
              <MyCommunities withDecoration showDashboard={showDashboard} showIssuance={showIssuance} />
            </div>
            <div className='cell medium-24 large-12 home_page__faqAndRecent grid-y grid-margin-y'>
              <FeaturedCommunities accountAddress={accountAddress} showDashboard={showDashboard} />
              <Faqs />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  accountAddress: state.network.accountAddress,
  communitiesKeys: getCommunitiesKeys(state)
})

const mapDispatchToProps = {
  push,
  loadModal
}

export default withTracker(connect(mapStateToProps, mapDispatchToProps)(HomePage))
