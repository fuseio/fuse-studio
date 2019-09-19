import React from 'react'
import ContentBox from 'components/home/components/ContentBox'
import FeaturedCommunities from 'components/home/components/FeaturedCommunities'
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
import { EMAIL_MODAL } from 'constants/uiConstants'
import { loadState } from 'utils/storage'

const HomePage = ({
  history,
  loadModal
}) => {
  const sendMailBlocker = () => {
    const subscribe = loadState('subscribe')
    if (!subscribe) {
      loadModal(EMAIL_MODAL)
    }
  }

  const showIssuance = () => {
    const subscribe = loadState('subscribe')
    if (!subscribe) {
      sendMailBlocker()
    } else {
      history.push('/view/issuance')
    }
  }

  const gotToFaqs = () => {
    window.open('https://docs.fusenet.io/the-fuse-studio/faq', '_blank')
  }

  const showCommunities = () => {
    history.push('/view/communities')
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
            <div className='home_page__button'><button onClick={showIssuance}>
              Launch your community
              <span style={{ marginLeft: '5px' }}><img src={arrowImage} alt='arrow' /></span>
            </button></div>
          </div>
          <div className='home_page__image home_page__image--second cell large-12 medium-12 small-15'>
            <img src={personImage} />
            <img src={!isMobileOnly ? groupImage : groupImageMobile} />
          </div>
        </div>
      </div>
      <div className='home_page__faq'>
        <div className='grid-container'>
          <div className='grid-x align-justify grid-margin-x grid-margin-y'>
            <div className='cell medium-24 large-12'>
              <ContentBox
                withDecoration={!isMobileOnly}
                subTitleAction={showCommunities}
                action={showIssuance}
                title='My communities'
                subTitle='Explore'
                actionTitle='Launch your community'
              >
                <FeaturedCommunities />
              </ContentBox>
            </div>
            <div className='cell medium-24 large-12'>
              <ContentBox title={`FAQ’S`} action={gotToFaqs} actionTitle='Learn more'>
                <Faqs />
              </ContentBox>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapDispatchToProps = {
  loadModal
}

export default withTracker(connect(null, mapDispatchToProps)(HomePage))
