import React, { useState, useEffect } from 'react'
// import ContentBox from 'components/home/components/ContentBox'
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
import { loadModal } from 'actions/ui'
import { CHOOSE_PROVIDER, SWITCH_NETWORK } from 'constants/uiConstants'
import { push } from 'connected-react-router'
import FeaturedCommunities from 'components/home/components/FeaturedCommunities'

const HomePage = ({
  loadModal,
  accountAddress,
  networkType,
  homeNetwork,
  push
}) => {
  const [isClicked, setClicked] = useState(false)
  const [path, setPath] = useState('/view/issuance')
  useEffect(() => {
    if (accountAddress && isClicked) {
      if (networkType === homeNetwork) {
        loadModal(SWITCH_NETWORK, { desiredNetworkType: ['ropsten', 'mainnet'], goBack: false })
      } else {
        push('/view/issuance')
      }
    }
    return () => { }
  }, [accountAddress])

  const showIssuance = () => {
    if (!accountAddress) {
      if (window && window.analytics) {
        window.analytics.track('Launch community button pressed - not connected')
      }
      loadModal(CHOOSE_PROVIDER, {
        setClicked
      })
    } else {
      push(path || '/view/issuance')
    }
  }

  return (
    <div className='home_page'>
      <NavBar />
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
            <div className='cell medium-24 large-12 template'>
              <Templates setPath={setPath} showIssuance={showIssuance} />
            </div>
            <div className='cell medium-24 large-12 home_page__faqAndRecent'>
              <Faqs />
              <FeaturedCommunities />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  accountAddress: state.network.accountAddress,
  networkType: state.network.networkType,
  homeNetwork: state.network.homeNetwork
})

const mapDispatchToProps = {
  loadModal,
  push
}

export default withTracker(connect(mapStateToProps, mapDispatchToProps)(HomePage))
