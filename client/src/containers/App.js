import React, {Component} from 'react'
import { connect } from 'react-redux'
import { isMobile, isAndroid, isIOS, isSafari, isTablet } from 'react-device-detect'
import Map from 'components/Map'
import TopNav from 'components/TopNav'
import CommunitiesList from 'components/CommunitiesList'
import ModalContainer from 'containers/ModalContainer';
import SignUp from 'components/SignUp'
import classNames from 'classnames'
import { ERROR_MODAL } from 'constants/uiConstants'
import {fetchCommunityContract, fetchClnContract} from 'actions/basicToken'
import {getNetworkType, checkAccountChange} from 'actions/web3'
import {onWeb3Ready} from 'services/web3'
import {loadModal} from 'actions/ui'
import {getAddresses} from 'selectors/web3'
import {isNetworkSupported, isNetworkDesired} from 'utils/web3'
import ReactGA from 'services/ga'
import 'scss/styles.scss'

class App extends Component {
	state = {
		isWelcome: true,
		out: false,
		welcomeDone: false
	}

	componentWillReceiveProps = (nextProps) => {
		if (nextProps.addresses !== this.props.addresses &&
				isNetworkSupported(nextProps.networkType)) {
			const coluTokens = [
				nextProps.addresses.TelAvivCoinAddress,
				nextProps.addresses.HaifaCoinAddress,
				nextProps.addresses.LiverpoolCoinAddress
			]
			this.props.fetchClnContract(nextProps.addresses.ColuLocalNetwork)
			coluTokens.forEach(this.props.fetchCommunityContract)
		}
		if (nextProps.networkType !== this.props.networkType && !isNetworkDesired(nextProps.networkType)) {
			this.props.loadModal(ERROR_MODAL)
		}
	}

	componentDidMount () {
		this.props.getNetworkType()
		onWeb3Ready.then(() => {
			this.props.checkAccountChange()
			setInterval(this.props.checkAccountChange, CONFIG.metaMask.accountPolling)
		})
		this.setState({
			welcomeDone: localStorage.getItem("welcome"),
			signupDone: localStorage.getItem("signup")
		})
	}

	onClickExplore = () => {
		this.setState({
			isWelcome: !this.state.isWelcome,
			panBy: { x: -100, y: 0 },
			welcomeDone: true
		})

		localStorage.setItem("welcome", true)

		ReactGA.event({
			category: 'Map',
			action: 'Click',
			label: 'Explore'
		})
	}

	render() {
		let currentRoute = this.props && this.props && this.props.location && this.props.location.pathname
		let mainContainerClass = classNames({
			"main-container": true,
			"flex": true,
			"column": true,
		})
		let welcomeClass = classNames({
			"welcome-wrapper": true,
			"hide": !this.state.isWelcome,
			"out": this.state.out
		})
		const mainWrapperClass = classNames({
			"flex": true,
			"column": true,
			"center": true,
			"fullscreen": !isMobile,
			"mobile-screen": isMobile,
			//"tablet": isTablet && !isIOS
		})

		const communityNav = (!this.state.isWelcome || this.state.welcomeDone || isMobile) && currentRoute !== '/view/contact-us' ? <CommunitiesList history={this.props.history}/> : null

		const welcome = currentRoute === '/' && !this.state.welcomeDone ? <div className={welcomeClass}>
							<div className="welcome-container">
								<h3>Welcome to the CLN community dApp</h3>
								<h4>Monitor the status of the CLN economies, buy and sell local community currencies issued on the network, and more</h4>
								<div className="button" onClick={this.onClickExplore}>EXPLORE</div>
							</div>
						</div> : null

		const signUpEmail = (currentRoute === '/' && !this.props.ui.signupHide && !this.props.ui.signupClose) ? <SignUp /> : null

		return <div className={mainWrapperClass}>
			{welcome}
			{signUpEmail}
			<div className={mainContainerClass}>
				<TopNav active={!this.state.isWelcome} history={this.props.history}/>
				<Map key="map" active={this.state.welcomeDone} currentRoute={currentRoute} history={this.props.history}/>
				{communityNav}
				<ModalContainer />
			</div>
		</div>
	}
}


const mapStateToProps = state => ({
	addresses: getAddresses(state),
	networkType: state.web3.networkType,
	web3: state.web3,
	ui: state.ui
})

export default connect(
	mapStateToProps, {
		fetchCommunityContract,
		fetchClnContract,
		getNetworkType,
		checkAccountChange,
		loadModal
	}
)(App)
