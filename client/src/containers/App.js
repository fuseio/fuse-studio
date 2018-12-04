import React, {Component} from 'react'
import { connect } from 'react-redux'
import { isMobile } from 'react-device-detect'
import Map from 'components/Map'
import TopNav from 'components/TopNav'
import Oven from 'components/oven/Oven'
import ModalContainer from 'containers/ModalContainer'
import classNames from 'classnames'
import {fetchClnContract} from 'actions/communities'
import {checkAccountChanged} from 'actions/network'
import {fetchTokenQuote} from 'actions/fiat'
import {loadModal} from 'actions/ui'
import {getAddresses} from 'selectors/network'
import ReactGA from 'services/ga'
import 'scss/styles.scss'

class App extends Component {
  state = {
    isWelcome: true,
    welcomeDone: false
  }

  componentDidMount () {
    this.props.fetchClnContract(this.props.addresses.ColuLocalNetwork)
    this.props.fetchTokenQuote('CLN', 'USD')
    this.setState({
      welcomeDone: window.localStorage.getItem('welcome')
    })
  }

  onClickExplore = () => {
    this.setState({
      isWelcome: !this.state.isWelcome,
      welcomeDone: true
    })

    window.localStorage.setItem('welcome', true)

    ReactGA.event({
      category: 'Map',
      action: 'Click',
      label: 'Explore'
    })
  }
  render () {
    let currentRoute = this.props && this.props && this.props.location && this.props.location.pathname
    let mainContainerClass = classNames({
      'main-container': true,
      'flex': true,
      'column': true
    })
    let welcomeClass = classNames({
      'welcome-wrapper': true,
      'hide': !this.state.isWelcome
    })
    const mainWrapperClass = classNames({
      'flex': true,
      'column': true,
      'center': true,
      'fullscreen': !isMobile,
      'mobile-screen': isMobile,
      'issuance-screen': currentRoute === '/view/issuance'
    })

    const communityNav = (!this.state.isWelcome || this.state.welcomeDone || isMobile) && currentRoute !== '/view/issuance' && currentRoute !== '/view/contact-us' && !currentRoute.includes('community') ? <Oven history={this.props.history} /> : null

    const welcome = currentRoute === '/' && !this.state.welcomeDone ? <div className={welcomeClass}>
      <div className='welcome-container'>
        <h3>Welcome to the CLN community dApp</h3>
        <h4>Monitor the status of the CLN economies, buy and sell local community currencies issued on the network, and more</h4>
        <div className='button' onClick={this.onClickExplore}>EXPLORE</div>
      </div>
    </div> : null

    return <div className={mainWrapperClass}>
      {welcome}
      <div className={mainContainerClass}>
        {currentRoute !== '/view/issuance' ? <TopNav
          active={!this.state.isWelcome}
          history={this.props.history}
        /> : null }
        <Map key='map' active={this.state.welcomeDone} currentRoute={currentRoute} history={this.props.history} />
        {communityNav}
        <ModalContainer />
      </div>
    </div>
  }
}

const mapStateToProps = state => ({
  addresses: getAddresses(state),
  ui: state.ui
})

const mapDispatchToProps = {
  fetchTokenQuote,
  fetchClnContract,
  checkAccountChanged,
  loadModal
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
