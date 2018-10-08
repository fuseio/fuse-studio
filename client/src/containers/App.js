import React, {Component} from 'react'
import { connect } from 'react-redux'
import { isMobile } from 'react-device-detect'
import Map from 'components/Map'
import TopNav from 'components/TopNav'
import CommunitiesList from 'components/CommunitiesList'
import ModalContainer from 'containers/ModalContainer'
import SignUp from 'components/SignUp'
import classNames from 'classnames'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import {fetchClnContract, initializeCommunity} from 'actions/communities'
import {getNetworkType, checkAccountChanged} from 'actions/network'
import {onWeb3Ready} from 'services/web3'
import {loadModal} from 'actions/ui'
import {getAddresses, getCommunityAddresses} from 'selectors/network'
import {isNetworkSupported, isNetworkDesired} from 'utils/network'
import ReactGA from 'services/ga'
import 'scss/styles.scss'

class App extends Component {
  state = {
    isWelcome: true,
    out: false,
    welcomeDone: false,
    toggleMenu: false
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.addresses !== this.props.addresses &&
        isNetworkSupported(nextProps.networkType)) {
      this.props.fetchClnContract(nextProps.addresses.ColuLocalNetwork)
      nextProps.communityAddresses.forEach(this.props.initializeCommunity)
    }
    if (nextProps.networkType !== this.props.networkType && !isNetworkDesired(nextProps.networkType)) {
      this.props.loadModal(WRONG_NETWORK_MODAL)
    }
  }

  componentDidMount () {
    this.props.getNetworkType()
    onWeb3Ready.then(({web3}) => {
      if (web3.currentProvider.isMetaMask) {
        web3.currentProvider.publicConfigStore.on('update', this.props.checkAccountChanged)
      }
    })
    this.setState({
      welcomeDone: window.localStorage.getItem('welcome'),
      signupDone: window.localStorage.getItem('signup')
    })
  }

  onClickExplore = () => {
    this.setState({
      isWelcome: !this.state.isWelcome,
      panBy: { x: -100, y: 0 },
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
      'hide': !this.state.isWelcome,
      'out': this.state.out
    })
    const mainWrapperClass = classNames({
      'flex': true,
      'column': true,
      'center': true,
      'fullscreen': !isMobile,
      'mobile-screen': isMobile,
      'issuance-screen': currentRoute === '/view/issuance',
      'open-mobile-nav': this.state.toggleMenu
    })

    const communityNav = (!this.state.isWelcome || this.state.welcomeDone || isMobile) && currentRoute !== '/view/issuance' && currentRoute !== '/view/contact-us' && !currentRoute.includes('community') ? <CommunitiesList history={this.props.history} /> : null

    const welcome = currentRoute === '/' && !this.state.welcomeDone ? <div className={welcomeClass}>
      <div className='welcome-container'>
        <h3>Welcome to the CLN community dApp</h3>
        <h4>Monitor the status of the CLN economies, buy and sell local community currencies issued on the network, and more</h4>
        <div className='button' onClick={this.onClickExplore}>EXPLORE</div>
      </div>
    </div> : null

    const signUpEmail = (currentRoute === '/' && !this.props.ui.signupHide && !this.props.ui.signupClose) ? <SignUp /> : null

    return <div className={mainWrapperClass}>
      {welcome}
      {signUpEmail}
      <div className={mainContainerClass}>
        {currentRoute !== '/view/issuance' ? <TopNav
          active={!this.state.isWelcome}
          history={this.props.history}
          toggleMenu={this.state.toggleMenu}
          setToggleMenu={() => this.setState({toggleMenu: !this.state.toggleMenu})}
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
  communityAddresses: getCommunityAddresses(state),
  networkType: state.network.networkType,
  ui: state.ui
})

export default connect(
  mapStateToProps, {
    fetchClnContract,
    initializeCommunity,
    getNetworkType,
    checkAccountChanged,
    loadModal
  }
)(App)
