import React, {Component} from 'react'
import { connect } from 'react-redux'
import { isMobile } from 'react-device-detect'
import Map from 'components/Map'
import TopNav from 'components/TopNav'
import Oven from 'components/oven/Oven'
import ModalContainer from 'containers/ModalContainer'
import classNames from 'classnames'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import {fetchClnContract} from 'actions/communities'
import {getNetworkType, checkAccountChanged} from 'actions/network'
import {fetchTokenQuote} from 'actions/fiat'
import {onWeb3Ready} from 'services/web3'
import {loadModal} from 'actions/ui'
import {getAddresses} from 'selectors/network'
import {isNetworkSupported} from 'utils/network'
import ReactGA from 'services/ga'
import 'scss/styles.scss'

class App extends Component {
  state = {
    isWelcome: true,
    welcomeDone: false
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.addresses !== this.props.addresses &&
        isNetworkSupported(nextProps.networkType)) {
      this.props.fetchClnContract(nextProps.addresses.ColuLocalNetwork)
    }
    if (nextProps.networkType !== this.props.networkType && !isNetworkSupported(nextProps.networkType)) {
      this.props.loadModal(WRONG_NETWORK_MODAL)
    }
  }

  componentDidMount () {
    this.props.fetchTokenQuote('CLN', 'USD')
    this.props.getNetworkType()
    onWeb3Ready.then(({web3}) => {
      if (web3.currentProvider.isMetaMask) {
        web3.currentProvider.publicConfigStore.on('update', this.props.checkAccountChanged)
      }
    })
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
    if (!isNetworkSupported(this.props.networkType)) {
      return null
    }

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
  networkType: state.network.networkType,
  ui: state.ui
})

const mapDispatchToProps = {
  fetchTokenQuote,
  fetchClnContract,
  getNetworkType,
  checkAccountChanged,
  loadModal
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
