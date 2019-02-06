import React, { Component } from 'react'
import TopNav from 'components/TopNav'
import classNames from 'classnames'
import AppstoreBanner from 'images/store-bg.svg'
import { connect } from 'react-redux'
import {fetchPartners} from 'actions/partner'
import {loadModal, hideModal} from 'actions/ui'
import FontAwesome from 'react-fontawesome'
import { APPSTORE_MODAL } from 'constants/uiConstants'

const Partners = (activeGenre, partners, loadModal) => {
  return (
    <div className='appstore-genres'>
      {partners !== undefined && Object.keys(partners).map((partner, key) => {
        if (activeGenre === partners[partner].category) {
          return (
            <div className='appstore-genre' key={key}>
              {Partner(partners, partner, key, loadModal)}
            </div>
          )
        } else if (activeGenre === 'All Genres') {
          return (
            <div className='appstore-genre' key={key}>
              {Partner(partners, partner, key, loadModal)}
            </div>
          )
        }
      })}
    </div>
  )
}

const Partner = (partners, partner, key, loadModal) => {
  return (
    <React.Fragment>
      <div className='appstore-genre-content' onClick={() => loadModal(APPSTORE_MODAL, {
        partner: partners[partner]
      })}>
        <img className='appstore-genre-logo' src={partners[partner].image} />
        <div className='appstore-genre-blocks'>
          <h3 className='appstore-genre-title'>
            {partners[partner].title}
          </h3>
          <p className='appstore-genre-author'>
            By <span>{partners[partner].author}</span>
          </p>
        </div>
      </div>
      <div className='appstore-genre-category'>
        <FontAwesome name='dollar-sign' />
        {partners[partner].category}
      </div>
      <p className='appstore-genre-description'>
        {partners[partner].description}
      </p>
    </React.Fragment>
  )
}

class AppStore extends Component {
  state = {
    activeGenre: 'All Genres'
  }

  componentDidMount () {
    this.props.fetchPartners()
  }
  showHomePage = () => this.props.history.push('/')

  renderGenres (partners) {
    const genres = []
    if (partners !== undefined && Object.keys(partners).length) {
      Object.keys(partners).map((partner) =>
        genres.push(partners[partner].category)
      )
    }
    let uniqueGenres = genres.filter((genre, pos) => genres.indexOf(genre) === pos)
    return uniqueGenres.map((genre, key) => {
      const appstoreFilterClass = classNames({
        'appstore-filter-genre': true,
        'active-genre': this.state.activeGenre === genre
      })
      return (
        <span
          className={appstoreFilterClass}
          key={key}
          onClick={() => this.setState({activeGenre: genre})}
        >
          {genre}
        </span>
      )
    })
  }

  render () {
    const partners = this.props.partners
    const appstoreDefaultClass = classNames({
      'appstore-filter-genre': true,
      'active-genre': this.state.activeGenre === 'All Genres'
    })
    return (
      <div className='appstore'>
        <div className='store-banner' style={{backgroundImage: `url(${AppstoreBanner})`}}>
          <TopNav
            active
            history={this.props.history}
            type={'appstore'}
            showHomePage={() => this.showHomePage()}
          />
          <div className='appstore-container'>
            <div className='appstore-banner'>
              <div className='appstore-banner-content'>
                <h2 className='appstore-banner-title'>Welcome to the App store</h2>
                <p className='appstore-banner-text'>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sodales ut lacus pretium imperdiet. Aenean sit amet dolor et mi lobortis euismod.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className='appstore-container'>
          <div className='appstore-content'>
            <div className='appstore-filter'>
              <span className='appstore-filter-text'>Popular by Genre</span>
              <span className={appstoreDefaultClass} onClick={() => this.setState({activeGenre: 'All Genres'})}>All Genres</span>
              {this.renderGenres(this.props.partners)}
            </div>
            <div className='appstore-genres'>
              {Partners(this.state.activeGenre, partners, this.props.loadModal)}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  fetchPartners,
  loadModal,
  hideModal
}

const mapStateToProps = state => {
  return {
    partners: state.entities.partners
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppStore)
