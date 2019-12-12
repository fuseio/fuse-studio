import React, { useState, useEffect } from 'react'
import Carousel, { Dots } from '@brainhubeu/react-carousel'
import isEmpty from 'lodash/isEmpty'
import Templates from 'components/home/components/Templates'
import Faqs from 'components/home/components/Faq'
import personImage from 'images/person.png'
import groupImageMobile from 'images/group_mobile.png'
import groupImage from 'images/group_image.png'
import NavBar from 'components/common/NavBar'
import { isMobileOnly } from 'react-device-detect'
import arrowImage from 'images/arrow_1.svg'
import GiftIcon from 'images/gift.svg'
import withTracker from 'containers/withTracker'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import FeaturedCommunities from 'components/home/components/FeaturedCommunities'
import FeaturedCommunity from 'components/common/FeaturedCommunity'
import { fetchCommunities } from 'actions/accounts'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

const toMatrix = (arr, width) =>
  arr.reduce((rows, key, index) => (index % width === 0 ? rows.push([key])
    : rows[rows.length - 1].push(key)) && rows, [])

const a11yProps = (index) => ({
  id: `scrollable-force-tab-${index}`,
  'aria-controls': `scrollable-force-tabpanel-${index}`
})

const TabPanel = (props) => {
  const { children, value, index, ...other } = props

  return (
    <Typography
      component='div'
      role='tabpanel'
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      <div style={{ padding: '40px 25px' }}>{children}</div>
    </Typography>
  )
}

const useTabsStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    minHeight: '80px',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px'
  },
  indicator: {
    backgroundColor: ' #052235'
  }
}))

const useTabStyles = makeStyles(theme => ({
  root: {
    fontSize: '1.1em',
    fontFamily: `'Gotham SSm A', 'Gotham SSm B', 'icomoon'`,
    fontWeight: '500'
  },
  textColorPrimary: {
    color: '#a4a4a4 !important'
  },
  selected: {
    color: '#25435a !important'
  }
}))

const HomePage = ({
  accountAddress,
  communitiesKeys,
  communities,
  metadata,
  fetchCommunities,
  web3connect,
  push,
  logout
}) => {
  const [value, setValue] = useState(0)
  const [valueSpinner, onChangeSpinner] = useState(0)
  const [path, setPath] = useState('/view/issuance')

  const tabsClasses = useTabsStyles()
  const tabClasses = useTabStyles()

  useEffect(() => {
    if (accountAddress) {
      fetchCommunities(accountAddress)
    }
    return () => { }
  }, [accountAddress])

  const showIssuance = () => {
    if (!accountAddress) {
      if (window && window.analytics) {
        window.analytics.track('Launch community button pressed - not connected')
      }
      web3connect.toggleModal()
    } else {
      push(path || '/view/issuance')
    }
  }

  const communitiesIOwnT = React.useMemo(() => {
    if (!isEmpty(communitiesKeys) && !isEmpty(communities)) {
      return communitiesKeys
        .map((communityAddress) => communities[communityAddress])
        .filter(obj => !!obj).filter(({ isAdmin, token }) => isAdmin && token)
    }
  }, [communitiesKeys, communities])

  // let filteredCommunities = []
  // if (communitiesKeys) {
  //   filteredCommunities = communitiesKeys
  //     .map((communityAddress) => communities[communityAddress])
  //     .filter(obj => !!obj)
  // }

  const showDashboard = (communityAddress, name) => {
    if (window && window.analytics) {
      if (name) {
        window.analytics.track(`Clicked on featured community - ${name}`)
      }
    }
    push(`/view/community/${communityAddress}`)
  }

  // let communitiesIOwn = filteredCommunities.filter(({ isAdmin, token }) => isAdmin && token)

  const slides = React.useMemo(() => {
    if (!isEmpty(communitiesIOwnT)) {
      const myCommunities = communitiesIOwnT.map((entity, index) => {
        const { community, token } = entity
        const { communityAddress } = community
        return (
          <div className='cell medium-12 small-24' key={index}>
            <FeaturedCommunity
              accountAddress={accountAddress}
              symbol={token && token.symbol}
              metadata={{
                ...metadata[token.tokenURI],
                ...metadata[community.communityURI]
              }}
              showDashboard={() => showDashboard(communityAddress)}
              community={community}
            />
          </div>
        )
      })
      const myCommunitiesList = toMatrix(myCommunities, 4).map((items) => (
        <div style={{ width: '100%' }} className='grid-x grid-margin-x grid-margin-y'>
          {items}
        </div>
      ))
      return myCommunitiesList
    }
  }, [communitiesIOwnT])

  const handleChange = (event, newValue) => setValue(newValue)

  return (
    <div className='home_page'>
      <NavBar logout={logout} web3connect={web3connect} />
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
            <div className='home_page__text--choose'>
              Or, choose a template:
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
                accountAddress && !isEmpty(communitiesIOwnT) ? (
                  <div className='home_page__tabs'>
                    <Tabs
                      classes={tabsClasses}
                      value={value}
                      onChange={handleChange}
                      variant='scrollable'
                      scrollButtons='on'
                      indicatorColor='primary'
                      textColor='inherit'
                    >
                      <Tab label='My communities' classes={tabClasses} {...a11yProps(0)} />
                      <Tab label='Templates' classes={tabClasses} {...a11yProps(1)} />
                    </Tabs>
                    <TabPanel value={value} index={0}>
                      <Carousel
                        value={valueSpinner}
                        centered
                        infinite
                        draggable
                        onChange={onChangeSpinner}
                        animationSpeed={1000}
                        slidesPerPage={1}
                        breakpoints={{
                          1000: {
                            slidesPerPage: 2
                          },
                          800: {
                            slidesPerPage: 1
                          }
                        }}
                      >
                        {slides}
                      </Carousel>
                      <Dots value={valueSpinner} onChange={onChangeSpinner} number={slides && slides.length} />
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                      <Templates setPath={setPath} showIssuance={showIssuance} />
                    </TabPanel>
                  </div>
                ) : (
                  <Templates withDecoration setPath={setPath} showIssuance={showIssuance} />
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
  metadata: state.entities.metadata,
  communities: state.entities.communities,
  communitiesKeys: state.accounts && state.accounts[state.network && state.network.accountAddress] && state.accounts[state.network && state.network.accountAddress].communities
})

const mapDispatchToProps = {
  push,
  fetchCommunities
}

export default withTracker(connect(mapStateToProps, mapDispatchToProps)(HomePage))
