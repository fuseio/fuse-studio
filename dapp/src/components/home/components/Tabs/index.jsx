import React, { useState, memo } from 'react'
import { connect } from 'react-redux'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import { makeStyles, withStyles } from '@material-ui/styles'
import Carousel, { Dots } from '@brainhubeu/react-carousel'
import isEmpty from 'lodash/isEmpty'

import FeaturedCommunity from 'components/common/FeaturedCommunity'
import Templates from 'components/home/components/Templates'

import { getCommunitiesKeys } from 'selectors/accounts'

const toMatrix = (arr, width) =>
  arr.reduce((rows, key, index) => (index % width === 0 ? rows.push([key])
    : rows[rows.length - 1].push(key)) && rows, [])

const a11yProps = (index) => ({
  id: `scrollable-force-tab-${index}`,
  'aria-controls': `scrollable-force-tabpanel-${index}`
})

const TabPanel = withStyles({
  root: {
    fontFamily: `'Gotham SSm A', 'Gotham SSm B', 'icomoon'`
  }
})((props) => {
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
      {children}
    </Typography>
  )
})

const useTabsStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#f8f8f8',
    fontFamily: `'Gotham SSm A', 'Gotham SSm B', 'icomoon'`,
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

const TabsWrapper = memo(({
  communitiesKeys,
  communities,
  showIssuance,
  showDashboard
}) => {
  const [value, setValue] = useState(0)
  const [valueSpinner, onChangeSpinner] = useState(0)

  const tabsClasses = useTabsStyles()
  const tabClasses = useTabStyles()

  const communitiesIOwn = React.useMemo(() => {
    return communitiesKeys
      .map((communityAddress) => communities[communityAddress])
      .filter(obj => !!obj).filter(({ isAdmin, token }) => isAdmin && token)
  }, [communitiesKeys, communities])

  const slides = React.useMemo(() => {
    if (!isEmpty(communitiesIOwn)) {
      const myCommunities = communitiesIOwn.map((entity, index) => {
        const { community, token } = entity
        const { communityAddress } = community
        return (
          <div className='cell medium-12 small-24' key={community && community.name}>
            <FeaturedCommunity
              token={token}
              showDashboard={() => showDashboard(communityAddress)}
              community={community}
            />
          </div>
        )
      })
      const myCommunitiesList = toMatrix(myCommunities, 4).map((items, index) => (
        <div style={{ width: '100%' }} key={index} className='grid-x grid-margin-x grid-margin-y'>
          {items}
        </div>
      ))
      return myCommunitiesList
    }
  }, [communitiesIOwn])

  const handleChange = (event, newValue) => setValue(newValue)

  return (
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
        <Tab disabled={isEmpty(communitiesIOwn)} label='My communities' classes={tabClasses} {...a11yProps(0)} />
        <Tab label='Templates' classes={tabClasses} {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <div style={{ padding: '40px 25px' }}>
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
        </div>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <div style={{ padding: '25px' }}><Templates showIssuance={showIssuance} /></div>
      </TabPanel>
    </div>
  )
}, (prevProps, nextProps) => {
  if (prevProps.communitiesKeys !== nextProps.communitiesKeys) {
    return false
  } else if (prevProps.communities !== nextProps.communities) {
    return false
  }

  return true
})

const mapStateToProps = (state) => ({
  accountAddress: state.network.accountAddress,
  communities: state.entities.communities,
  communitiesKeys: getCommunitiesKeys(state)
})

export default connect(mapStateToProps, null)(TabsWrapper)
