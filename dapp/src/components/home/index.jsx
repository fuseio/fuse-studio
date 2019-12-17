import React, { useState, useEffect } from 'react'

import isEmpty from 'lodash/isEmpty'
import Templates from 'components/home/components/Templates'
import Tabs from 'components/home/components/Tabs'
import Faqs from 'components/home/components/Faq'
import personImage from 'images/person.png'
import groupImageMobile from 'images/group_mobile.png'
import groupImage from 'images/group_image.png'
import { isMobileOnly } from 'react-device-detect'
import arrowImage from 'images/arrow_1.svg'
import GiftIcon from 'images/gift.svg'
import withTracker from 'containers/withTracker'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import FeaturedCommunities from 'components/home/components/FeaturedCommunities'
// import FeaturedCommunity from 'components/common/FeaturedCommunity'
import { fetchCommunities } from 'actions/accounts'
import { getCommunitiesKeys } from 'selectors/accounts'

// import Tabs from '@material-ui/core/Tabs'
// import Tab from '@material-ui/core/Tab'
// import Typography from '@material-ui/core/Typography'
// import { makeStyles } from '@material-ui/styles'

// const toMatrix = (arr, width) =>
//   arr.reduce((rows, key, index) => (index % width === 0 ? rows.push([key])
//     : rows[rows.length - 1].push(key)) && rows, [])

// const a11yProps = (index) => ({
//   id: `scrollable-force-tab-${index}`,
//   'aria-controls': `scrollable-force-tabpanel-${index}`
// })

// const TabPanel = (props) => {
//   const { children, value, index, ...other } = props

//   return (
//     <Typography
//       component='div'
//       role='tabpanel'
//       hidden={value !== index}
//       id={`scrollable-force-tabpanel-${index}`}
//       aria-labelledby={`scrollable-force-tab-${index}`}
//       {...other}
//     >
//       <div style={{ padding: '40px 25px' }}>{children}</div>
//     </Typography>
//   )
// }

// const useTabsStyles = makeStyles(theme => ({
//   root: {
//     backgroundColor: '#f8f8f8',
//     alignItems: 'center',
//     minHeight: '80px',
//     borderTopLeftRadius: '10px',
//     borderTopRightRadius: '10px'
//   },
//   indicator: {
//     backgroundColor: ' #052235'
//   }
// }))

// const useTabStyles = makeStyles(theme => ({
//   root: {
//     fontSize: '1.1em',
//     fontFamily: `'Gotham SSm A', 'Gotham SSm B', 'icomoon'`,
//     fontWeight: '500'
//   },
//   textColorPrimary: {
//     color: '#a4a4a4 !important'
//   },
//   selected: {
//     color: '#25435a !important'
//   }
// }))

const HomePage = ({
  accountAddress,
  web3connect,
  fetchCommunities,
  push,
  communitiesKeys
}) => {
  useEffect(() => {
    if (accountAddress) {
      fetchCommunities(accountAddress)
    }
    return () => { }
  }, [accountAddress])

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
  push,
  fetchCommunities
}

export default withTracker(connect(mapStateToProps, mapDispatchToProps)(HomePage))
