import React, { useState, useEffect } from 'react'
import { push } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'

import withTracker from 'containers/withTracker'
import MyCommunities from 'components/home/components/MyCommunities'
import Faqs from 'components/home/components/Faq'
import FeaturedCommunities from 'components/home/components/FeaturedCommunities'

import homeImage from 'images/studio_home.png'
import arrowImage from 'images/arrow_1.svg'

import { FormattedMessage } from 'react-intl';

const HomePage = ({
  handleConnect
}) => {
  const dispatch = useDispatch()
  const { accountAddress } = useSelector(state => state.network)
  const [moveToIssuance, setMove] = useState(false)

  useEffect(() => {
    if (moveToIssuance && accountAddress) {
      dispatch(push('/view/issuance'))
    }
  }, [moveToIssuance, accountAddress])

  const showIssuance = () => {
    if (!accountAddress) {
      if (window && window.analytics) {
        window.analytics.track('Launch community button pressed - not connected')
      }
      handleConnect()
      setMove(true)
    } else {
      window.analytics.track('Launch community button pressed - connected')
      dispatch(push('/view/issuance'))
    }
  }

  const showDashboard = (communityAddress, name) => {
    if (window && window.analytics) {
      if (name) {
        window.analytics.track(`Clicked on featured community`, { name })
      }
    }
    dispatch(push(`/view/community/${communityAddress}`))
  }

  return (
    <div className='home_page'>
      <div className='home_page__wrapper grid-container'>
        <div className='home_page__banner grid-x align-middle'>
          <div className='home_page__content cell medium-12 large-12' style={{ height: '50%' }}>
            <h2 className='home_page__title'><FormattedMessage defaultMessage="Welcome to Fuse Studio" /></h2>
            <p className='home_page__text'>
              <FormattedMessage 
                defaultMessage="Create your own custom branded wallet and{newLine} currency in a few simple steps" 
                values={{
                  newLine: <br />,
                }}
              />
            </p>
            <div className='home_page__button'>
              <button onClick={() => {
                showIssuance()
              }}>
                <FormattedMessage defaultMessage="Launch an economy" />
                <span style={{ marginLeft: '5px' }}>
                  <img src={arrowImage} alt='arrow' />
                </span>
              </button>
            </div>
          </div>
          <div className='home_page__image cell large-12 medium-12'>
            <img src={homeImage} />
          </div>
        </div>
      </div>
      <div className='home_page__faq'>
        <div className='grid-container'>
          <div className='grid-x align-justify grid-margin-x grid-margin-y'>
            <div className='cell medium-24 large-12'>
              <FormattedMessage defaultMessage="My economies">
                {txt => <MyCommunities title={txt} showDashboard={showDashboard} showIssuance={showIssuance} />}
              </FormattedMessage>
            </div>
            <div className='cell medium-24 large-12'>
              <FeaturedCommunities showDashboard={showDashboard} />
            </div>
            <Faqs />
          </div>
        </div>
      </div>
    </div>
  )
}

export default withTracker(HomePage)
