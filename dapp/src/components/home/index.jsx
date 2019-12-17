import React from 'react'
import { push } from 'connected-react-router'
import { isMobileOnly } from 'react-device-detect'
import { connect } from 'react-redux'
import isEmpty from 'lodash/isEmpty'

import withTracker from 'containers/withTracker'
import Templates from 'components/home/components/Templates'
import Tabs from 'components/home/components/Tabs'
import Faqs from 'components/home/components/Faq'
import FeaturedCommunities from 'components/home/components/FeaturedCommunities'

import personImage from 'images/person.png'
import groupImageMobile from 'images/group_mobile.png'
import groupImage from 'images/group_image.png'
import arrowImage from 'images/arrow_1.svg'
import GiftIcon from 'images/gift.svg'

import { getCommunitiesKeys } from 'selectors/accounts'

const HomePage = ({
  accountAddress,
  web3connect,
  push,
  communitiesKeys
}) => {
  const showIssuance = (templateId) => {
    if (!accountAddress) {
      if (window && window.analytics) {
        window.analytics.track('Launch community button pressed - not connected')
      }
      web3connect.toggleModal()
    } else {
      const path = templateId ? `/view/issuance/${templateId}` : '/view/issuance'
      push(path)
    }
  }

  const showDashboard = (communityAddress, name) => {
    if (window && window.analytics) {
      if (name) {
        window.analytics.track(`Clicked on featured community - ${name}`)
      }
    }
    push(`/view/community/${communityAddress}`)
  }

  return (
    <div className='home_page'>
      <div className='home_page__wrapper grid-container'>
        <div className='home_page__banner grid-x align-bottom'>
          <div className='home_page__content cell medium-12 large-9' style={{ height: '50%' }}>
            <h2 className='home_page__title'>Jump start<br /> your economy</h2>
            <p className='home_page__text'>
              Finish the community wizard on<br /> mainnet and <span>get rewarded 100<br /> Fuse tokens <img src={GiftIcon} /></span>
            </p>
            <div className='home_page__button'>
              <button onClick={() => {
                window.analytics.track('Launch community button pressed')
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
              {
                !isEmpty(communitiesKeys) ? (
                  <Tabs showDashboard={showDashboard} showIssuance={showIssuance} />
                ) : (
                  <Templates withDecoration showDashboard={showDashboard} showIssuance={showIssuance} />
                )
              }
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
  push
}

export default withTracker(connect(mapStateToProps, mapDispatchToProps)(HomePage))
