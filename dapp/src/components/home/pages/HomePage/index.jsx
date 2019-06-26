import React, { Component } from 'react'
import ContentBox from '../../components/ContentBox'
import FeaturedCommunities from '../../components/FeaturedCommunities'
import Faqs from '../../components/Faq'
import personImage from 'images/person.png'
import groupImageMobile from 'images/group_mobile.png'
import groupImage from 'images/group_image.png'
import NavBar from 'components/common/NavBar'
import { isMobileOnly } from 'react-device-detect'
import ReactGA from 'services/ga'

export default class HomePage extends Component {
  showIssuance = () => {
    this.props.history.push('/view/issuance')
    ReactGA.event({
      category: 'Top Bar',
      action: 'Click',
      label: 'issuance'
    })
  }

  showCommunities = () => {
    this.props.history.push('/view/communities')
  }

  render () {
    return (
      <div className='home_page'>
        <NavBar />
        <div className='home_page__wrapper grid-container'>
          <div className='home_page__banner grid-x align-bottom'>
            <div className='home_page__image home_page__image--first cell large-2 show-for-large'>
              <div><img src={personImage} /></div>
            </div>
            <div className='home_page__content cell medium-12 large-9' style={{ height: '50%' }}>
              <h2 className='home_page__title'>Launch your<br /> community on Fuse</h2>
              <p className='home_page__text home_page__text--space'>
                Fuse is intended for community currencies operated by companies and entrepreneurs.
              </p>
              <p className='home_page__text'>
                It streamlines the process of launching your community currency and provide battle-tested and customizable tools to get it off the ground
              </p>
              <div className='home_page__button'><button onClick={this.showIssuance}>Launch your community</button></div>
            </div>
            <div className='home_page__image home_page__image--second cell large-10 medium-12 small-15'>
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
                  action={this.showCommunities}
                  title='Featured communities'
                  actionTitle='Check out more communities >'
                >
                  <FeaturedCommunities />
                </ContentBox>
              </div>
              <div className='cell medium-24 large-12'>
                <ContentBox title={`FAQ’S`} actionTitle='Learn more >'>
                  <Faqs />
                </ContentBox>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
